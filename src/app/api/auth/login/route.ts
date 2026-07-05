import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createSessionToken, storeSession, SESSION_COOKIE_NAME, type AuthenticatedUser } from '@/lib/auth-session';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    const user = await db.get<AuthenticatedUser>(
      'SELECT id, nombre, apellido, email, roleId FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'No se encontró una cuenta con este correo electrónico' },
        { status: 404 }
      );
    }

    const token = createSessionToken();
    await storeSession(token, user.id);

    const response = NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        roleId: user.roleId,
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}
