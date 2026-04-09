'use client';

import { useState } from 'react';
import StatsGrid from './StatsGrid';
import FinesTable from './FinesTable';
import GameweekSelector from './GameweekSelector';

interface AdminDashboardProps {
  initialEntries: any[];
  season: any;
}

export default function AdminDashboard({ initialEntries, season }: AdminDashboardProps) {
  const [selectedGameweek, setSelectedGameweek] = useState(initialEntries[0]?.gameweek || 1);
  const [entries, setEntries] = useState(initialEntries);

  const filteredEntries = entries.filter(e => e.gameweek === selectedGameweek);

  const stats = {
    totalRevenue: entries.reduce((acc, e) => acc + (e.status === 'paid' ? e.amountDue : 0), 0),
    totalOutstanding: entries.reduce((acc, e) => acc + (e.status === 'unpaid' ? e.amountDue : 0), 0),
    totalPlayers: new Set(entries.map(e => e.playerName)).size,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-fpl-purple tracking-tight">League Overview</h2>
          <p className="text-gray-500 font-medium">Monitoring {season.name}</p>
        </div>
        <GameweekSelector 
          current={selectedGameweek} 
          onChange={setSelectedGameweek}
          available={Array.from(new Set(entries.map(e => e.gameweek))).sort((a, b) => b - a)}
        />
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-10">
        <FinesTable 
          entries={filteredEntries} 
          onUpdate={() => window.location.reload()} 
        />
      </div>
    </div>
  );
}
