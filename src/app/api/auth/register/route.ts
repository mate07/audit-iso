import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createSessionToken, storeSession, SESSION_COOKIE_NAME } from '@/lib/auth-session';

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

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    const userId = crypto.randomUUID();
    const defaultRole = roleId || 'r-auditor';

    await db.run(
      'INSERT INTO users (id, nombre, apellido, email, roleId) VALUES (?, ?, ?, ?, ?)',
      [userId, nombre, apellido, email, defaultRole]
    );

    const token = createSessionToken();
    await storeSession(token, userId);

    const response = NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: userId,
        nombre,
        apellido,
        email,
        roleId: defaultRole,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch {
    console.error('Registration error');
    return NextResponse.json(
      { error: 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const roles = await db.all('SELECT * FROM roles ORDER BY name ASC');
    return NextResponse.json(roles);
  } catch {
    return NextResponse.json({ error: 'Error fetching roles' }, { status: 500 });
  }
}
