import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Obtener la última auditoría del usuario específico
    const audit = await db.get<{ 
      id: string, 
      currentStepIndex: number,
      empresa: string | null,
      direccion: string | null,
      responsable: string | null
    }>('SELECT * FROM audits WHERE userId = ? ORDER BY updatedAt DESC LIMIT 1', [userId]);

    if (!audit) {
      return NextResponse.json(null);
    }

    // Obtener equipo
    const team = await db.all<{ id: string, nombre: string, apellido: string, carnet: string }>('SELECT * FROM auditors WHERE auditId = ?', [audit.id]);

    // Obtener respuestas
    const responses = await db.all<{ questionId: string, status: string, notes: string | null }>('SELECT * FROM responses WHERE auditId = ?', [audit.id]);

    // Transformar respuestas a formato de mapa
    const responseMap: Record<string, any> = {};
    responses.forEach((r: { questionId: string, status: string, notes: string | null }) => {
      responseMap[r.questionId] = {
        status: r.status,
        notes: r.notes || '',
      };
    });

    return NextResponse.json({
      id: audit.id,
      team,
      empresa: audit.empresa || '',
      direccion: audit.direccion || '',
      responsable: audit.responsable || '',
      currentStepIndex: audit.currentStepIndex,
      responses: responseMap,
    });
  } catch (error) {
    console.error('Error loading audit:', error);
    return NextResponse.json({ error: 'Failed to load audit' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { team, responses, currentStepIndex, id: existingId, empresa, direccion, responsable, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const id = existingId || uuidv4();
    const now = new Date().toISOString();

    // Usar una transacción manual
    await db.run('BEGIN TRANSACTION');

    try {
      if (existingId) {
        // Actualizar auditoría existente
        await db.run(
          'UPDATE audits SET updatedAt = ?, currentStepIndex = ?, empresa = ?, direccion = ?, responsable = ?, userId = ? WHERE id = ?',
          [now, currentStepIndex, empresa || '', direccion || '', responsable || '', userId, id]
        );
      } else {
        // Crear nueva auditoría
        await db.run(
          'INSERT INTO audits (id, userId, createdAt, updatedAt, currentStepIndex, empresa, direccion, responsable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, now, now, currentStepIndex, empresa || '', direccion || '', responsable || '']
        );
      }

      // Sincronizar equipo (borrar y recrear)
      await db.run('DELETE FROM auditors WHERE auditId = ?', [id]);
      if (team && team.length > 0) {
        for (const m of team) {
          await db.run(
            'INSERT INTO auditors (id, nombre, apellido, carnet, auditId) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), m.nombre, m.apellido, m.carnet, id]
          );
        }
      }

      // Sincronizar respuestas (Upsert manual)
      for (const [qId, res] of Object.entries(responses)) {
        const r = res as any;
        await db.run(`
          INSERT INTO responses (id, questionId, status, notes, auditId)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(auditId, questionId) DO UPDATE SET
            status = excluded.status,
            notes = excluded.notes
        `, [uuidv4(), qId, r.status, r.notes, id]);
      }

      await db.run('COMMIT');
      return NextResponse.json({ id });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error saving audit:', error);
    return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // En lugar de borrar, creamos una nueva auditoría en blanco vinculada al usuario.
    const newAuditId = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      'INSERT INTO audits (id, userId, currentStepIndex, createdAt, updatedAt, empresa, direccion, responsable) VALUES (?, ?, 0, ?, ?, ?, ?, ?)',
      [newAuditId, userId, now, now, '', '', '']
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Nueva auditoría iniciada. La anterior ha sido conservada.',
      auditId: newAuditId 
    });
  } catch (error) {
    console.error('Error starting new audit:', error);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
