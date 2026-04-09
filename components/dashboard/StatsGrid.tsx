import { CheckCircle2, Clock, Users } from 'lucide-react';
import formatNPR from '@/lib/utils';

interface Stats {
  totalRevenue: number;
  totalOutstanding: number;
  totalPlayers: number;
}

export default function StatsGrid({ stats }: { stats: Stats }) {
  const items = [
    { name: 'Total Revenue', value: formatNPR(stats.totalRevenue), icon: CheckCircle2, color: 'text-fpl-green' },
    { name: 'Total Outstanding', value: formatNPR(stats.totalOutstanding), icon: Clock, color: 'text-fpl-pink' },
    { name: 'Active Players', value: stats.totalPlayers.toString(), icon: Users, color: 'text-fpl-purple' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.name} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300">
          <div className={`p-3 rounded-2xl bg-gray-50 inline-block mb-4 group-hover:scale-110 transition-transform ${item.color}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.name}</p>
          <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
