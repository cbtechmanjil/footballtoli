import { getDb } from './index';
import { players, gameweeks, entries, seasons } from './schema';

async function seed() {
  const db = getDb();

  console.log('Seeding data...');
  
  const season1 = await db.insert(seasons).values({
    name: 'Test Season',
    status: 'active',
  }).returning().get();

  // Add default admin
  await db.insert(users).values({
    id: 'admin-001',
    name: 'System Admin',
    email: 'admin@footballtoli.com',
    password: '$2a$10$vO.6bX0M6X3f8bX3f/8bX.vO.6bX0M6X3f8bX3f/8bX.vO.6bX0M6X',
    role: 'admin',
  }).onConflictDoNothing().run();

  // Add players
  const player1 = await db.insert(players).values({
    name: 'Manjil',
    fantasyName: 'Manjil Magic',
  }).returning().get();

  const player2 = await db.insert(players).values({
    name: 'John',
    fantasyName: 'John Jesters',
  }).returning().get();

  // Add gameweeks
  const gw1 = await db.insert(gameweeks).values({
    number: 1,
    seasonId: season1.id,
    status: 'completed',
  }).returning().get();

  const gw2 = await db.insert(gameweeks).values({
    number: 2,
    seasonId: season1.id,
    status: 'active',
  }).returning().get();

  // Add entries
  await db.insert(entries).values({
    playerId: player1.id,
    gameweekId: gw1.id,
    amountDue: 100,
    points: 60,
    rank: 2,
    status: 'paid',
  });

  await db.insert(entries).values({
    playerId: player2.id,
    gameweekId: gw1.id,
    amountDue: 50,
    points: 70,
    rank: 1,
    status: 'unpaid',
  });

  console.log('Seeding completed!');
}

seed().catch(console.error);
