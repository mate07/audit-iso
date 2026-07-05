import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { loadIsoCatalog } from '@/lib/iso-catalog';

export async function GET() {
  try {
    const db = await getDb();
    const catalog = await loadIsoCatalog(db);
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error loading ISO catalog:', error);
    return NextResponse.json({ error: 'Failed to load ISO catalog' }, { status: 500 });
  }
}
