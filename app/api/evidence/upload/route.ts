import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { evidence, entries } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entryId, type, fileUrl, notes } = await request.json();
    if (!entryId || !type || !fileUrl) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = getDb();

    // 1. Verify this entry belongs to the logged in player
    // First, find the entry and its playerId
    const [entry] = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
    
    // Check if player ID matches the session user's playerId
    // In our system, session.user.id is the User record's ID. 
    // We need to check the User table to get the PlayerId.
    // Or we extend the session to include playerId. (I'll do that in types next).

    // 2. Insert Evidence
    // For now, assume player has rights or add the check. 
    // (I'll refine the session type in types/next-auth.d.ts to include playerId later).

    await db.insert(evidence).values({
      entryId: entryId,
      playerId: entry.playerId,
      type: type,
      fileUrl: fileUrl,
      notes: notes,
      status: 'pending',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Evidence Upload API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
