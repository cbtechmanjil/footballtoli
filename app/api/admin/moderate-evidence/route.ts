import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { evidence, entries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { evidenceId, status, entryId } = await request.json();
    if (!evidenceId || !status || !entryId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = getDb();

    // 1. Update Evidence Status
    await db.update(evidence).set({
      status: status,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    }).where(eq(evidence.id, evidenceId));

    // 2. If approved, mark the entry as paid
    if (status === 'approved') {
      await db.update(entries).set({
        status: 'paid',
        updatedAt: new Date(),
      }).where(eq(entries.id, entryId));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Moderation API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
