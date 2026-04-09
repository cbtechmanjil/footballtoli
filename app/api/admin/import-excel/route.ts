import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { players, gameweeks, entries, seasons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import ExcelJS from 'exceljs';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as ArrayBuffer);
    const worksheet = workbook.worksheets[0];

    const db = getDb();

    // 1. Get/Create Active Season
    let [activeSeason] = await db.select().from(seasons).where(eq(seasons.status, 'active')).limit(1);
    if (!activeSeason) {
      [activeSeason] = await db.insert(seasons).values({ name: 'Default Season', status: 'active' }).returning();
    }

    // 2. Map Player Names from Row 1, Column B onwards
    const headerRow = worksheet.getRow(1);
    const playerMap: Record<number, number> = {}; // col -> playerId
    
    for (let col = 2; col <= worksheet.columnCount; col++) {
      const name = headerRow.getCell(col).text?.trim();
      if (name && name !== 'TOTAL' && name !== '') {
        // Find existing player or create
        let [player] = await db.select().from(players).where(eq(players.fantasyName, name)).limit(1);
        if (!player) {
          [player] = await db.insert(players).values({ name: name, fantasyName: name }).returning();
        }
        playerMap[col] = player.id;
      }
    }

    let recordsCount = 0;

    // 3. Process Gameweek Rows starting from Row 3 (Row 2 is header, Row 3 is GW1)
    // Adjust based on the image: Row 1 has Team Name, Row 2 has labels like "FCAmrit" labels.
    // Based on the screenshot, B1 labels seem to be the team names.
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < 3) return; // Skip headers

      const gwLabel = row.getCell(1).text?.trim();
      if (!gwLabel || !gwLabel.startsWith('GW')) return;

      const gwNumber = parseInt(gwLabel.replace('GW', '')) || 0;
      if (gwNumber === 0) return;

      // Ensure gameweek exists
      // (Self-correcting sync) - Use an async immediately invoked function for this block if needed, 
      // but we'll just handle it sequentially.
      
      // Since this is a server action/API, we can run DB commands inside.
      // Note: Re-using GW if it exists.
    });

    // Re-scanning properly with sync/await
    for (let rowNum = 3; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const gwLabel = row.getCell(1).text?.trim();
      if (!gwLabel || !gwLabel.startsWith('GW')) continue;
      if (gwLabel.includes('TOTAL')) continue;

      const gwNumber = parseInt(gwLabel.replace('GW', '')) || 0;
      
      // Get/Create GW
      let [gw] = await db.select().from(gameweeks).where(eq(gameweeks.number, gwNumber)).limit(1);
      if (!gw) {
        [gw] = await db.insert(gameweeks).values({ 
          number: gwNumber, 
          seasonId: activeSeason.id,
          status: 'completed' 
        }).returning();
      }

      // Process each player's column
      for (const colStr in playerMap) {
        const col = parseInt(colStr);
        const playerId = playerMap[col];
        const cell = row.getCell(col);
        const value = parseFloat(cell.text) || 0;

        // Check background color (Green = Paid)
        // ExcelJS colors: Green is usually something like 'FF00B050' or 'FF92D050'
        // We'll check if fill exists and fgColor is a variant of green.
        const fill = cell.fill as any;
        let isPaid = false;
        if (fill && fill.type === 'pattern' && fill.fgColor?.argb) {
          const argb = fill.fgColor.argb.toUpperCase();
          // Heuristic for green-ish colors
          isPaid = argb.includes('00FF') || argb.includes('92D050') || argb.includes('00B050') || argb.includes('C6EFCE');
        }

        // winner check (0)
        if (value === 0) isPaid = true;

        await db.insert(entries).values({
          playerId: playerId,
          gameweekId: gw.id,
          amountDue: value,
          status: isPaid ? 'paid' : 'unpaid',
          points: 0, // Points not available in this horizontal view
        }).onConflictDoNothing();

        recordsCount++;
      }
    }

    return NextResponse.json({ success: true, count: recordsCount });
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
