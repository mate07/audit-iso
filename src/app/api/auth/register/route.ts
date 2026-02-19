import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const { nombre, apellido, email, roleId } = await request.json();

    if (!nombre || !apellido || !email) {
      return NextResponse.json(
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    const userId = uuidv4();
    const defaultRole = roleId || 'r-auditor'; // Por defecto es Auditor

    await db.run(
      'INSERT INTO users (id, nombre, apellido, email, roleId) VALUES (?, ?, ?, ?, ?)',
      [userId, nombre, apellido, email, defaultRole]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      userId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const roles = await db.all('SELECT * FROM roles');
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching roles' }, { status: 500 });
  }
}
