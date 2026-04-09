import { getDb } from './lib/db';
import { users, seasons, priceList, players } from './lib/db/schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const db = getDb();
  console.log('Seeding Phase 2 data...');
  // Note: getDb() will log the path if we add it there, or we can check here

  // 1. Create Admin User
  const adminId = uuidv4();
  const hashedAdminPw = await bcrypt.hash('admin123', 10);
  
  await db.insert(users).values({
    id: adminId,
    name: 'Admin User',
    email: 'admin@footballtoli.com',
    password: hashedAdminPw,
    role: 'admin',
  }).onConflictDoNothing();

  // 2. Create a Season
  const [season] = await db.insert(seasons).values({
    name: 'FPL Season 2023/24',
    status: 'active',
  }).returning();

  // 3. Create Price List (Positions 1-12 as per screenshot)
  const prices = [0, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500];
  for (let i = 0; i < prices.length; i++) {
    await db.insert(priceList).values({
      seasonId: season.id,
      position: i + 1,
      amount: prices[i],
    });
  }

  // 4. Create some players
  const playerNames = ['Amrit', 'Mun Mun', 'Bijju', 'BPN', 'Kisan', 'Binay'];
  for (const name of playerNames) {
    await db.insert(players).values({
      name: name,
      fantasyName: `Team ${name}`,
    });
  }

  console.log('Seed completed! Login with admin@footballtoli.com / admin123');
}

seed().catch(console.error);
