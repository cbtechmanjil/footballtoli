'use client';

import { useState } from 'react';
import { Trophy, RefreshCw, Save } from 'lucide-react';
import { Player, PriceSetting } from '@/lib/db/schema';
import { calculateFines } from '@/lib/calculations';

interface BatchEntryProps {
  players: Player[];
  prices: PriceSetting[];
  currentGameweek: number;
}

export default function BatchEntryForm({ players, prices, currentGameweek }: BatchEntryProps) {
  const [points, setPoints] = useState<Record<number, number>>({});
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePointChange = (playerId: number, value: string) => {
    const pts = parseInt(value) || 0;
    setPoints(prev => ({ ...prev, [playerId]: pts }));
  };

  const handleCalculate = () => {
    const playerPoints = players.map(p => ({
      playerId: p.id,
      points: points[p.id] || 0
    }));

    const calculated = calculateFines(playerPoints, prices);
    const resultsWithNames = calculated.map(res => ({
      ...res,
      playerName: players.find(p => p.id === res.playerId)?.name,
      fantasyName: players.find(p => p.id === res.playerId)?.fantasyName,
    })).sort((a, b) => b.points - a.points);

    setResults(resultsWithNames);
  };

  const handleSave = async () => {
    if (results.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/save-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameweekNumber: currentGameweek,
          entries: results
        })
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Gameweek results saved successfully!');
    } catch (err) {
      alert('Error saving results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-fpl-purple">Batch Point Entry</h1>
            <p className="text-sm text-gray-500 font-medium">Enter points for all players in Gameweek {currentGameweek}.</p>
          </div>
          <button 
            onClick={handleCalculate}
            className="flex items-center space-x-2 bg-fpl-purple/10 text-fpl-purple px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fpl-purple/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Calculate Ranks</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div key={player.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-black text-fpl-purple truncate max-w-[120px]">{player.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[120px]">{player.fantasyName}</div>
                </div>
                <input 
                  type="number"
                  placeholder="Pts"
                  value={points[player.id] || ''}
                  onChange={(e) => handlePointChange(player.id, e.target.value)}
                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-bold focus:ring-2 focus:ring-fpl-purple/20 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-fpl-green/10 rounded-2xl text-fpl-green">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-fpl-purple">Calculation Preview</h2>
                <p className="text-sm text-gray-500 font-medium">Verified rankings and average amounts for tied players.</p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 bg-fpl-green text-fpl-purple px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fpl-green/90 shadow-lg shadow-fpl-green/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Commit Results'}</span>
            </button>
          </div>

          <div className="overflow-hidden border border-gray-50 rounded-2xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Player</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Points</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((res, idx) => (
                  <tr key={res.playerId} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-[10px] ${
                        res.rank === 1 ? 'bg-fpl-pink text-white shadow-md' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {res.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{res.playerName}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{res.fantasyName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-fpl-purple">{res.points}</td>
                    <td className="px-6 py-4 text-sm font-bold text-fpl-pink">रू {res.amountDue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
