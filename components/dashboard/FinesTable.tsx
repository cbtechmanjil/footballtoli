import React from 'react';
import { Player, Fine } from '@/lib/db/schema';
import { CheckCircle, XCircle, Info, Trash2 } from 'lucide-react';

interface FinesListProps {
  players: Player[];
  fines: Fine[];
  isAdmin: boolean;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function FinesList({ players, fines, isAdmin, onToggleStatus, onDelete }: FinesListProps) {
  const getPlayer = (id: number) => players.find(p => p.id === id);

  const formatNPR = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount).replace('NPR', 'रू');
  };

  if (fines.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-700">No fines recorded for this week</h3>
        <p className="text-gray-500">Perfect discipline or missing data?</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-fpl-dark-purple/5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-fpl-dark-purple">
          Weekly Log
        </h3>
        <span className="text-xs font-bold text-fpl-dark-purple/60">{fines.length} Incident(s)</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fines.map((fine) => {
              const player = getPlayer(fine.playerId);
              const isPaid = fine.status === 'paid';
              
              return (
                <tr key={fine.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-fpl-dark-purple">{player?.name}</div>
                    <div className="text-[10px] uppercase font-bold text-fpl-purple/60 tracking-wider">
                      {player?.teamName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-medium">{fine.reason}</div>
                    {fine.remarks && <div className="text-xs text-gray-400 italic">"{fine.remarks}"</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 flex items-center">
                      {formatNPR(fine.amount)}
                      {fine.evidenceUrl && (
                        <a 
                          href={fine.evidenceUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="ml-2 text-fpl-purple hover:text-fpl-pink transition-colors"
                          title="View Proof"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => isAdmin && onToggleStatus(fine.id)}
                      disabled={!isAdmin}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        isPaid 
                        ? 'bg-fpl-green/20 text-fpl-dark-purple border border-fpl-green/30' 
                        : 'bg-fpl-pink/20 text-fpl-pink border border-fpl-pink/30'
                      } ${isAdmin ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                    >
                      {isPaid ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {fine.status}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDelete(fine.id)}
                        className="text-gray-300 hover:text-fpl-pink transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
