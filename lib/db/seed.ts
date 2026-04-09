import { getDb } from './index';
import { players, gameweeks, fines } from './schema';

async function seed() {
  const db = getDb();

  console.log('Seeding data...');

  // Add players
  const player1 = await db.insert(players).values({
    name: 'Manjil',
    teamName: 'Manjil Magic',
  }).returning().get();

  const player2 = await db.insert(players).values({
    name: 'John',
    teamName: 'John Jesters',
  }).returning().get();

  // Add gameweeks
  const gw1 = await db.insert(gameweeks).values({
    number: 1,
    status: 'completed',
  }).returning().get();

  const gw2 = await db.insert(gameweeks).values({
    number: 2,
    status: 'active',
  }).returning().get();

  // Add fines
  await db.insert(fines).values({
    playerId: player1.id,
    gameweekId: gw1.id,
    amount: 100,
    reason: 'Missing Deadline',
    status: 'paid',
  });

  await db.insert(fines).values({
    playerId: player2.id,
    gameweekId: gw1.id,
    amount: 50,
    reason: 'Bench Points > 20',
    status: 'unpaid',
  });

  console.log('Seeding completed!');
}

seed().catch(console.error);
