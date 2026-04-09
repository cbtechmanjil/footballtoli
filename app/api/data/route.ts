import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { players, gameweeks, fines } from '@/lib/db/schema';
import { eq, sum, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const gwId = searchParams.get('gwId');

    // 1. Fetch all players
    const allPlayers = await db.select().from(players);

    // 2. Fetch all gameweeks
    const allGameweeks = await db.select().from(gameweeks).orderBy(gameweeks.number);

    // 3. Determine current gameweek
    const activeGw = allGameweeks.find((gw: any) => gw.status === 'active') || allGameweeks[allGameweeks.length - 1];
    const targetGwId = gwId ? parseInt(gwId) : activeGw?.id;

    // 4. Fetch fines for the target gameweek
    const gwFines = targetGwId 
      ? await db.select().from(fines).where(eq(fines.gameweekId, targetGwId))
      : [];

    // 5. Fetch season totals (group by player)
    // Drizzle doesn't have a simple group by aggregator for SQLite in all drivers, 
    // but we can fetch all fines and aggregate in JS for simplicity in a small app.
    const allFines = await db.select().from(fines);

    const seasonStats = allPlayers.map((p: any) => {
      const pFines = allFines.filter((f: any) => f.playerId === p.id);
      return {
        playerId: p.id,
        playerName: p.name,
        teamName: p.teamName,
        totalDue: pFines.reduce((acc: number, f: any) => acc + f.amount, 0),
        totalPaid: pFines.filter((f: any) => f.status === 'paid').reduce((acc: number, f: any) => acc + f.amount, 0),
        totalUnpaid: pFines.filter((f: any) => f.status === 'unpaid').reduce((acc: number, f: any) => acc + f.amount, 0),
      };
    });

    return NextResponse.json({
      players: allPlayers,
      gameweeks: allGameweeks,
      activeGwId: targetGwId,
      fines: gwFines,
      seasonStats,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
