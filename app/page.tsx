'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import StatsGrid from '@/components/dashboard/StatsGrid';
import FinesTable from '@/components/dashboard/FinesTable';
import AddFineForm from '@/components/dashboard/AddFineForm';
import { Player, Fine, Gameweek } from '@/lib/db/schema';
import { Loader2, Settings, Lock } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<{
    players: Player[];
    gameweeks: Gameweek[];
    activeGwId: number | null;
    fines: Fine[];
    seasonStats: any[];
  } | null>(null);
  const [selectedGwId, setSelectedGwId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  async function fetchData(gwId?: number) {
    setLoading(true);
    try {
      const url = gwId ? `/api/data?gwId=${gwId}` : '/api/data';
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
      if (!selectedGwId && json.activeGwId) {
        setSelectedGwId(json.activeGwId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}` 
        },
        body: JSON.stringify({ action: 'TOGGLE_PAYMENT', data: { id } }),
      });
      fetchData(selectedGwId || undefined);
    } catch (err) {
      alert('Failed to update. Check password.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdmin(true);
    setShowLogin(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-fpl-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-fpl-dark-purple font-sans pb-20">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {data && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-fpl-purple/60 mb-1">
                  Overview
                </h2>
                <h1 className="text-3xl font-black tracking-tight">Financial Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowLogin(true)}
                  className={`p-2 rounded-lg transition-colors ${isAdmin ? 'text-fpl-green bg-fpl-green/10' : 'text-gray-400 hover:text-fpl-purple bg-white border border-gray-100'}`}
                >
                  {isAdmin ? <Settings className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Aggregated Stats */}
            <StatsGrid stats={{
              totalDue: data.seasonStats.reduce((acc: number, s: any) => acc + s.totalDue, 0),
              totalPaid: data.seasonStats.reduce((acc: number, s: any) => acc + s.totalPaid, 0),
              totalUnpaid: data.seasonStats.reduce((acc: number, s: any) => acc + s.totalUnpaid, 0),
            }} />

            {/* Gameweek Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-fpl-purple/60">Select GW:</span>
              <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                {data.gameweeks.map((gw) => (
                  <button
                    key={gw.id}
                    onClick={() => {
                      setSelectedGwId(gw.id);
                      fetchData(gw.id);
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedGwId === gw.id 
                      ? 'bg-fpl-purple text-white shadow-md scale-105' 
                      : 'bg-white text-fpl-purple/60 hover:bg-fpl-purple/5'
                    }`}
                  >
                    GW {gw.number}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Fines List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {isAdmin && selectedGwId && (
                  <AddFineForm 
                    players={data.players} 
                    gameweekId={selectedGwId} 
                    onSuccess={() => fetchData(selectedGwId)}
                    password={password}
                  />
                )}
                
                <FinesTable 
                  players={data.players} 
                  fines={data.fines} 
                  isAdmin={isAdmin}
                  onToggleStatus={handleToggleStatus}
                  onDelete={async (id) => {
                    if (confirm('Are you sure you want to delete this fine?')) {
                      await fetch('/api/actions', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${password}`
                        },
                        body: JSON.stringify({ action: 'DELETE_FINE', data: { id } }),
                      });
                      fetchData(selectedGwId || undefined);
                    }
                  }}
                />
              </div>

              {/* Season Leaderboard (Sidebar) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-fpl-pink/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-fpl-pink">
                      Season Standings
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.seasonStats.sort((a, b) => b.totalDue - a.totalDue).map((stat) => (
                      <div key={stat.playerId} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold">{stat.playerName}</div>
                          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            {stat.teamName}
                          </div>
                        </div>
                        <div className="text-right text-sm font-black text-fpl-dark-purple">
                          {stat.totalUnpaid > 0 && (
                            <div className="text-[10px] text-fpl-pink">Unpaid: रू{stat.totalUnpaid}</div>
                          )}
                          रू{stat.totalPaid}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-fpl-dark-purple/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-fpl-purple" />
              Admin Access
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  Enter Password
                </label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-fpl-purple/20 transition-all font-mono"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-fpl-purple text-white font-black py-3 rounded-xl hover:bg-fpl-dark-purple transition-colors shadow-lg shadow-fpl-purple/20"
                >
                  Unlock
                </button>
                <button 
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="px-4 py-3 text-gray-400 font-bold hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
