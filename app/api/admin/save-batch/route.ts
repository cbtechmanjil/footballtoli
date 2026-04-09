import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { entries, gameweeks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameweekNumber, entries: results } = await request.json();
    const db = getDb();

    // 1. Get or create gameweek
    let [gw] = await db.select().from(gameweeks).where(eq(gameweeks.number, gameweekNumber));
    if (!gw) {
      [gw] = await db.insert(gameweeks).values({
        number: gameweekNumber,
        status: 'completed'
      }).returning();
    } else {
      await db.update(gameweeks).set({ status: 'completed' }).where(eq(gameweeks.id, gw.id));
    }

    // 2. Insert/Update entries
    for (const res of results) {
      // Check if entry exists for this player and gameweek
      const [existing] = await db.select().from(entries).where(
        and(
          eq(entries.playerId, res.playerId),
          eq(entries.gameweekId, gw.id)
        )
      );

      if (existing) {
        await db.update(entries).set({
          points: res.points,
          rank: res.rank,
          amountDue: res.amountDue,
          updatedAt: new Date(),
        }).where(eq(entries.id, existing.id));
      } else {
        await db.insert(entries).values({
          playerId: res.playerId,
          gameweekId: gw.id,
          points: res.points,
          rank: res.rank,
          amountDue: res.amountDue,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Batch Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
