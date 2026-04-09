import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { fines, players, gameweeks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fpl123';

function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    throw new Error('Unauthorized');
  }
}

export async function POST(request: Request) {
  try {
    checkAuth(request);
    const db = getDb();
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'ADD_FINE':
        const newFine = await db.insert(fines).values({
          playerId: data.playerId,
          gameweekId: data.gameweekId,
          amount: data.amount,
          reason: data.reason,
          status: 'unpaid',
          remarks: data.remarks,
        }).returning().get();
        return NextResponse.json(newFine);

      case 'TOGGLE_PAYMENT':
        const existing = await db.select().from(fines).where(eq(fines.id, data.id)).get();
        if (!existing) throw new Error('Fine not found');
        
        const updated = await db.update(fines)
          .set({ status: existing.status === 'paid' ? 'unpaid' : 'paid', updatedAt: new Date() })
          .where(eq(fines.id, data.id))
          .returning()
          .get();
        return NextResponse.json(updated);

      case 'DELETE_FINE':
        await db.delete(fines).where(eq(fines.id, data.id));
        return NextResponse.json({ success: true });

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
