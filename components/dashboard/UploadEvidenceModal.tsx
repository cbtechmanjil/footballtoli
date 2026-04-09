'use client';

import { useState } from 'react';
import { Upload, X, ShieldCheck } from 'lucide-react';

interface UploadEvidenceModalProps {
  entryId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadEvidenceModal({ entryId, onClose, onSuccess }: UploadEvidenceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'payment' | 'result'>('payment');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      // 1. Get pre-signed URL
      const upRes = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const { url, publicUrl, key } = await upRes.json();

      // 2. Upload to R2
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      const fileUrl = publicUrl || key;

      // 3. Save evidence record
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, type, fileUrl, notes }),
      });

      if (!res.ok) throw new Error('Failed to save record');
      alert('Evidence uploaded successfully! Pending admin review.');
      onSuccess();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-fpl-purple/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-fpl-purple" />
            <h3 className="text-sm font-black uppercase tracking-widest text-fpl-purple">Upload Evidence</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-6 text-left">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Evidence Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                onClick={() => setType('payment')}
                className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                  type === 'payment' ? 'bg-fpl-purple text-white border-fpl-purple' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-fpl-purple/20'
                }`}
              >
                Payment Proof
              </button>
              <button 
                type="button" 
                onClick={() => setType('result')}
                className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                  type === 'result' ? 'bg-fpl-purple text-white border-fpl-purple' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-fpl-purple/20'
                }`}
              >
                FPL Result
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Choose File (Image/PDF)</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-fpl-purple/30 transition-all group">
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-fpl-purple transition-colors mb-2" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {file ? file.name : 'Click to select file'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Additional Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via Khalti / Screenshot of GW2 points"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none h-24 resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={!file || loading}
            className="w-full bg-fpl-green text-fpl-purple font-black py-4 rounded-xl shadow-lg hover:shadow-fpl-green/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Evidence'}
          </button>
        </form>
      </div>
    </div>
  );
}
