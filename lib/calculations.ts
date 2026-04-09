import { PriceSetting } from './db/schema';

export interface PlayerPoints {
  playerId: number;
  points: number;
}

export interface CalculatedResult {
  playerId: number;
  points: number;
  rank: number;
  amountDue: number;
}

export function calculateFines(
  playerPoints: PlayerPoints[],
  priceList: PriceSetting[]
): CalculatedResult[] {
  // 1. Sort players by points descending
  const sorted = [...playerPoints].sort((a, b) => b.points - a.points);
  
  // 2. Map prices for easy lookup
  const priceMap = new Map<number, number>();
  priceList.forEach((p) => priceMap.set(p.position, p.amount));

  const results: CalculatedResult[] = [];
  let i = 0;

  while (i < sorted.length) {
    const currentPoints = sorted[i].points;
    const samePointsIndices: number[] = [];

    // Find all players with the same points (ties)
    for (let j = i; j < sorted.length; j++) {
      if (sorted[j].points === currentPoints) {
        samePointsIndices.push(j);
      } else {
        break;
      }
    }

    // Determine the ranks occupied by this group (1-indexed)
    const startRank = i + 1;
    const endRank = i + samePointsIndices.length;

    // Calculate average price for these ranks
    let totalAmount = 0;
    for (let r = startRank; r <= endRank; r++) {
      totalAmount += priceMap.get(r) || 0;
    }
    const averageAmount = totalAmount / samePointsIndices.length;

    // Assign current group
    samePointsIndices.forEach((idx) => {
      results.push({
        playerId: sorted[idx].playerId,
        points: currentPoints,
        rank: startRank, // Standard competition ranking: all ties get the same rank
        amountDue: averageAmount,
      });
    });

    i += samePointsIndices.length;
  }

  return results;
}
