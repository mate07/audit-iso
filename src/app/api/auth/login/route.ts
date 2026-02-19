import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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

    // Buscar al usuario por email
    const user = await db.get(
      'SELECT id, nombre, apellido, email, roleId FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'No se encontró una cuenta con este correo electrónico' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        roleId: user.roleId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}
