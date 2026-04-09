import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { entries, players, gameweeks, seasons } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import PlayerDashboard from '@/components/dashboard/PlayerDashboard';
import Header from '@/components/dashboard/Header';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const db = getDb();
  
  // Get active season
  const [activeSeason] = await db.select().from(seasons).where(eq(seasons.status, 'active')).limit(1);
  
  if (!activeSeason) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-fpl-purple">No Active Season</h2>
          <p className="text-gray-500">Please wait for the administrator to initialize a season.</p>
        </div>
      </div>
    );
  }

  if (session.user.role === 'admin') {
    // Admin View: League Standings & Overview
    const allEntries = await db.select({
      id: entries.id,
      playerName: players.name,
      fantasyName: players.fantasyName,
      points: entries.points,
      amountDue: entries.amountDue,
      status: entries.status,
      rank: entries.rank,
      gameweek: gameweeks.number,
    })
    .from(entries)
    .innerJoin(players, eq(entries.playerId, players.id))
    .innerJoin(gameweeks, eq(entries.gameweekId, gameweeks.id))
    .where(eq(gameweeks.seasonId, activeSeason.id))
    .orderBy(desc(gameweeks.number));

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AdminDashboard initialEntries={allEntries} season={activeSeason} />
        </main>
      </div>
    );
  } else {
    // Player View: Personal Record
    const userEntries = await db.select({
      id: entries.id,
      points: entries.points,
      amountDue: entries.amountDue,
      status: entries.status,
      rank: entries.rank,
      gameweek: gameweeks.number,
      remarks: entries.remarks,
    })
    .from(entries)
    .innerJoin(gameweeks, eq(entries.gameweekId, gameweeks.id))
    .where(and(
      eq(entries.playerId, Number(session.user.id)), // This assumes session.user.id is linked toplayerId in DB
      eq(gameweeks.seasonId, activeSeason.id)
    ))
    .orderBy(desc(gameweeks.number));

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <PlayerDashboard entries={userEntries} season={activeSeason} user={session.user} />
        </main>
      </div>
    );
  }
}
