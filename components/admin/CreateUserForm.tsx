'use client';

import { useState } from 'react';
import { Player } from '@/lib/db/schema';
import { UserPlus } from 'lucide-react';

export default function CreateUserForm({ players }: { players: Player[] }) {
  const [playerId, setPlayerId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, email, password, role: 'player' })
      });
      if (!res.ok) throw new Error('Account creation failed');
      alert('Success! Player can now log in.');
      window.location.reload();
    } catch (err) {
      alert('Error: Check if email is unique and all fields are filled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Link to Player</label>
        <select 
          required
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none"
        >
          <option value="">Select a Player</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.fantasyName})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Login Email</label>
        <input 
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none"
          placeholder="player@example.com"
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Temporary Password</label>
        <input 
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none"
          placeholder="••••••••"
        />
      </div>

      <button 
        type="submit"
        disabled={loading || !playerId}
        className="w-full bg-fpl-purple text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fpl-purple/90 shadow-lg shadow-fpl-purple/20 transition-all flex items-center justify-center space-x-2"
      >
        <UserPlus className="w-4 h-4" />
        <span>{loading ? 'Creating...' : 'Create Account'}</span>
      </button>
    </form>
  );
}
