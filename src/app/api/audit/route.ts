import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-session';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const audit = await db.get<{
      id: string;
      currentStepIndex: number;
      empresa: string | null;
      direccion: string | null;
      responsable: string | null;
    }>(
      'SELECT * FROM audits WHERE userId = ? ORDER BY updatedAt DESC LIMIT 1',
      [user.id]
    );

    if (!audit) {
      return NextResponse.json(null);
    }

    const team = await db.all<{
      id: string;
      nombre: string;
      apellido: string;
      email: string | null;
    }>('SELECT id, nombre, apellido, COALESCE(email, carnet) AS email FROM audit_team_members WHERE auditId = ? ORDER BY createdAt ASC', [audit.id]);

    const responses = await db.all<{
      questionId: string;
      status: string;
      notes: string | null;
    }>('SELECT questionId, status, notes FROM audit_responses WHERE auditId = ?', [audit.id]);

    const responseMap: Record<string, { status: string; notes: string }> = {};
    responses.forEach((response) => {
      responseMap[response.questionId] = {
        status: response.status,
        notes: response.notes || '',
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
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const body = await request.json();
    const {
      team,
      responses,
      currentStepIndex,
      id: existingId,
      empresa,
      direccion,
      responsable,
    } = body;

    const now = new Date().toISOString();
    const auditId = existingId || uuidv4();

    await db.run('BEGIN TRANSACTION');

    try {
      if (existingId) {
        const currentAudit = await db.get<{ id: string }>(
          'SELECT id FROM audits WHERE id = ? AND userId = ?',
          [existingId, user.id]
        );

        if (!currentAudit) {
          await db.run('ROLLBACK');
          return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
        }

        await db.run(
          'UPDATE audits SET updatedAt = ?, currentStepIndex = ?, empresa = ?, direccion = ?, responsable = ? WHERE id = ? AND userId = ?',
          [now, currentStepIndex, empresa || '', direccion || '', responsable || '', auditId, user.id]
        );
      } else {
        await db.run(
          'INSERT INTO audits (id, userId, createdAt, updatedAt, currentStepIndex, empresa, direccion, responsable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [auditId, user.id, now, now, currentStepIndex || 0, empresa || '', direccion || '', responsable || '']
        );
      }

      await db.run('DELETE FROM audit_team_members WHERE auditId = ?', [auditId]);
      if (Array.isArray(team) && team.length > 0) {
        for (const member of team) {
          const email = (member.email || member.carnet || '').trim();

          if (!email) {
            continue;
          }

          await db.run(
            'INSERT INTO audit_team_members (id, nombre, apellido, carnet, email, auditId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), member.nombre, member.apellido, email, email, auditId, now]
          );
        }
      }

      await db.run('DELETE FROM audit_responses WHERE auditId = ?', [auditId]);
      for (const [questionId, response] of Object.entries(responses || {})) {
        const typedResponse = response as { status?: string; notes?: string };
        if (!typedResponse.status) {
          continue;
        }

        await db.run(
          'INSERT INTO audit_responses (id, questionId, status, notes, auditId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            uuidv4(),
            questionId,
            typedResponse.status,
            typedResponse.notes || '',
            auditId,
            now,
            now,
          ]
        );
      }

      await db.run('COMMIT');
      return NextResponse.json({ id: auditId });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error saving audit:', error);
    return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const newAuditId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO audits (id, userId, currentStepIndex, createdAt, updatedAt, empresa, direccion, responsable) VALUES (?, ?, 0, ?, ?, ?, ?, ?)',
      [newAuditId, user.id, now, now, '', '', '']
    );

    return NextResponse.json({
      success: true,
      message: 'Nueva auditoría iniciada. La anterior ha sido conservada.',
      auditId: newAuditId,
    });
  } catch (error) {
    console.error('Error starting new audit:', error);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
