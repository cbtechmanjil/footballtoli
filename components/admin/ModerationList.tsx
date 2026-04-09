'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import formatNPR from '@/lib/utils';

interface ModerationListProps {
  initialEvidence: any[];
}

export default function ModerationList({ initialEvidence }: ModerationListProps) {
  const [evidenceItems, setEvidenceItems] = useState(initialEvidence);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleModerate = async (evidenceId: number, entryId: number, status: 'approved' | 'rejected') => {
    setLoadingId(evidenceId);
    try {
      const res = await fetch('/api/admin/moderate-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceId, entryId, status }),
      });

      if (!res.ok) throw new Error('Action failed');
      
      // Remove from list upon successful moderation
      setEvidenceItems(prev => prev.filter(item => item.id !== evidenceId));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {evidenceItems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 text-center">
          <div className="bg-white p-4 rounded-2xl inline-block shadow-sm mb-4">
            <CheckCircle2 className="w-8 h-8 text-fpl-green" />
          </div>
          <p className="text-gray-500 font-medium">All evidence cleared! No pending moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {evidenceItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 relative overflow-hidden">
              <div className="w-full md:w-48 h-48 bg-gray-50 rounded-2xl flex-shrink-0 relative group">
                {item.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img 
                    src={item.fileUrl} 
                    alt="Evidence" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-[10px] font-black uppercase">PDF Document</span>
                  </div>
                )}
                <a 
                  href={item.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute inset-0 bg-fpl-purple/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-2xl font-black text-xs uppercase tracking-widest space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Full Size</span>
                </a>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    item.type === 'payment' ? 'bg-fpl-green/10 text-fpl-purple' : 'bg-fpl-pink/10 text-fpl-pink'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm font-black text-fpl-purple">GW {item.gameweek}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm font-bold text-gray-900">{formatNPR(item.amountDue)}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-fpl-purple leading-tight">{item.playerName}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.fantasyName}</p>
                </div>

                {item.notes && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                    <p className="text-xs text-gray-600 italic font-medium">"{item.notes}"</p>
                  </div>
                )}
                
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Uploaded {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex md:flex-col gap-2 justify-end">
                <button 
                  disabled={loadingId === item.id}
                  onClick={() => handleModerate(item.id, item.entryId, 'approved')}
                  className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 bg-fpl-green text-fpl-purple px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fpl-green/90 shadow-lg shadow-fpl-green/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loadingId === item.id ? 'Wait...' : 'Approve'}</span>
                </button>
                <button 
                  disabled={loadingId === item.id}
                  onClick={() => handleModerate(item.id, item.entryId, 'rejected')}
                  className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 bg-white text-fpl-pink border border-fpl-pink/20 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fpl-pink hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
