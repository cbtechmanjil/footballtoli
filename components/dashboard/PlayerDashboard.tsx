'use client';

import { CheckCircle2, XCircle, Clock, Upload, Image as ImageIcon } from 'lucide-react';
import formatNPR from '@/lib/utils';
import { useState } from 'react';
import UploadEvidenceModal from './UploadEvidenceModal';

interface PlayerDashboardProps {
  entries: any[];
  season: any;
  user: any;
}

export default function PlayerDashboard({ entries, season, user }: PlayerDashboardProps) {
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  
  const totalDue = entries.reduce((acc, entry) => acc + entry.amountDue, 0);
  const totalPaid = entries.reduce((acc, entry) => entry.status === 'paid' ? acc + entry.amountDue : acc, 0);
  const totalUnpaid = totalDue - totalPaid;

  const stats = [
    { name: 'Total Season Due', value: formatNPR(totalDue), icon: Clock, color: 'text-fpl-purple' },
    { name: 'Total Paid', value: formatNPR(totalPaid), icon: CheckCircle2, color: 'text-fpl-green' },
    { name: 'Remaining Balance', value: formatNPR(totalUnpaid), icon: XCircle, color: 'text-fpl-pink' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-fpl-purple tracking-tight">My Season Record</h2>
          <p className="text-gray-500 font-medium">History for {season.name}</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-2 h-2 bg-fpl-green rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-fpl-purple">Live Data Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300">
            <div className={`p-3 rounded-2xl bg-gray-50 inline-block mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.name}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-fpl-purple">Weekly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Week</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Points / Rank</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total Due</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-fpl-purple text-sm">GW {entry.gameweek}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{entry.points} pts</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rank: {entry.rank || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900 text-sm">{formatNPR(entry.amountDue)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      entry.status === 'paid' ? 'bg-fpl-green/10 text-fpl-purple' : 'bg-fpl-pink/10 text-fpl-pink'
                    }`}>
                      {entry.status === 'paid' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {entry.status !== 'paid' && (
                      <button 
                        onClick={() => setSelectedEntry(entry.id)}
                        className="inline-flex items-center space-x-2 bg-fpl-purple text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-fpl-purple/90 transition-all active:scale-95 shadow-lg shadow-fpl-purple/20"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Proof</span>
                      </button>
                    )}
                    {entry.status === 'paid' && (
                       <button className="text-gray-300 cursor-not-allowed">
                         <ImageIcon className="w-4 h-4 mx-auto" />
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEntry && (
        <UploadEvidenceModal 
          entryId={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
          onSuccess={() => {
            setSelectedEntry(null);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}
