'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Import failed');

      setStatus({ type: 'success', message: `Successfully imported ${result.count} records!` });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8 text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-black text-fpl-purple mb-2">Legacy Excel Importer</h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          Upload your historical FPL Excel sheet. The system will automatically detect players, 
          gameweeks, and payment status (Green cells = Paid).
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className={`relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center ${
          file ? 'border-fpl-green bg-fpl-green/5' : 'border-gray-200 bg-gray-50 hover:border-fpl-purple/30 group'
        }`}>
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          
          <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${
            file ? 'bg-fpl-green/20' : 'bg-fpl-purple/10'
          }`}>
            {file ? <CheckCircle2 className="w-8 h-8 text-fpl-green" /> : <FileSpreadsheet className="w-8 h-8 text-fpl-purple" />}
          </div>
          
          <div className="text-sm font-black text-gray-700 mb-1">
            {file ? file.name : 'Choose Excel File'}
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Drag and drop or click to browse'}
          </p>
        </div>

        {status && (
          <div className={`mt-6 p-4 rounded-2xl flex items-start space-x-3 ${
            status.type === 'success' ? 'bg-fpl-green/10 text-fpl-purple' : 'bg-fpl-pink/10 text-fpl-pink'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-xs font-bold leading-tight">{status.message}</p>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full mt-8 bg-fpl-purple text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fpl-purple/90 shadow-lg shadow-fpl-purple/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span>{loading ? 'Processing Data...' : 'Start Import'}</span>
        </button>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Import Tips</h3>
        <ul className="text-[11px] text-blue-800 font-medium space-y-1.5 list-disc pl-4">
          <li>Ensure row 1 contains the <strong>Team Names</strong> starting from column B.</li>
          <li>Gameweeks should be in Column A (GW1, GW2...).</li>
          <li>Fines should be numbers.</li>
          <li><strong>Green backgrounds</strong> in cells will automatically mark the entry as "Paid".</li>
        </ul>
      </div>
    </div>
  );
}
