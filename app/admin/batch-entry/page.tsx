import { getDb } from '@/lib/db';
import { players, priceList, seasons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import BatchEntryForm from '@/components/admin/BatchEntryForm';

export default async function BatchEntryPage() {
  const db = getDb();
  
  const allPlayers = await db.select().from(players).orderBy(players.name);
  
  // Get active season and its pricing
  const [activeSeason] = await db.select().from(seasons).where(eq(seasons.status, 'active')).limit(1);
  const prices = await db.select().from(priceList).where(eq(priceList.seasonId, activeSeason.id));

  // For now, let's assume we are entering for the most recent gameweek or next one
  const currentGameweek = 1; // This should be dynamic later

  return (
    <BatchEntryForm 
      players={allPlayers} 
      prices={prices} 
      currentGameweek={currentGameweek} 
    />
  );
}
