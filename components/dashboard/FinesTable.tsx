'use client';

import React from 'react';
import { CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import formatNPR from '@/lib/utils';

interface FinesTableProps {
  entries: any[];
  onUpdate: () => void;
}

export default function FinesTable({ entries, onUpdate }: FinesTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-black text-fpl-purple">No history available</h3>
        <p className="text-gray-500 font-medium italic">Data will appear once points are entered.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-fpl-purple">
          Gameweek Breakdown
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {entries.length} Player Records
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">Points / Rank</th>
              <th className="px-6 py-4">Amount Due</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map((entry) => {
              const isPaid = entry.status === 'paid';
              
              return (
                <tr key={entry.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{entry.playerName}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {entry.fantasyName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-fpl-purple">{entry.points} Pts</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rank {entry.rank}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-gray-900 flex items-center">
                      {formatNPR(entry.amountDue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      isPaid 
                      ? 'bg-fpl-green/10 text-fpl-purple border border-fpl-green/20' 
                      : 'bg-fpl-pink/10 text-fpl-pink border border-fpl-pink/20'
                    }`}>
                      {isPaid ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {entry.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
