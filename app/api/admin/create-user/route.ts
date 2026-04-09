import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { users, players } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId, email, password, role } = await request.json();
    if (!playerId || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = getDb();

    // 1. Check if email exists
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Get player info
    const [player] = await db.select().from(players).where(eq(players.id, parseInt(playerId))).limit(1);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // 4. Create user
    await db.insert(users).values({
      id: uuidv4(),
      name: player.name,
      email: email,
      password: hashedPassword,
      role: role || 'player',
      playerId: player.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Create User Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
