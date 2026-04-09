import { getDb } from '@/lib/db';
import { evidence, players, entries, gameweeks } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import ModerationList from '@/components/admin/ModerationList';

export default async function ModerationPage() {
  const db = getDb();
  
  const pendingEvidence = await db.select({
    id: evidence.id,
    type: evidence.type,
    fileUrl: evidence.fileUrl,
    notes: evidence.notes,
    createdAt: evidence.createdAt,
    playerName: players.name,
    fantasyName: players.fantasyName,
    gameweek: gameweeks.number,
    amountDue: entries.amountDue,
    entryId: entries.id,
  })
  .from(evidence)
  .innerJoin(players, eq(evidence.playerId, players.id))
  .innerJoin(entries, eq(evidence.entryId, entries.id))
  .innerJoin(gameweeks, eq(entries.gameweekId, gameweeks.id))
  .where(eq(evidence.status, 'pending'))
  .orderBy(desc(evidence.createdAt));

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-fpl-purple">Evidence Moderation</h1>
        <p className="text-sm text-gray-500 font-medium">Review and approve player payment proofs and result screenshots.</p>
      </div>

      <ModerationList initialEvidence={pendingEvidence} />
    </div>
  );
}
