import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, deleteSession, getSessionTokenFromCookies } from '@/lib/auth-session';

export async function POST() {
  try {
    const token = await getSessionTokenFromCookies();
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
