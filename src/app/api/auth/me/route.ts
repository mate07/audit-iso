import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-session';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed to load current session' }, { status: 500 });
  }
}
