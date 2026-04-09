import React from 'react';
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StatsProps {
  stats: {
    totalDue: number;
    totalPaid: number;
    totalUnpaid: number;
  };
}

export default function StatsGrid({ stats }: StatsProps) {
  const formatNPR = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount).replace('NPR', 'रू');
  };

  const cards = [
    {
      title: 'Total Outstanding',
      value: formatNPR(stats.totalUnpaid),
      icon: AlertCircle,
      color: 'text-fpl-pink',
      bg: 'bg-fpl-pink/10',
      border: 'border-fpl-pink/20',
    },
    {
      title: 'Total Collected',
      value: formatNPR(stats.totalPaid),
      icon: CheckCircle2,
      color: 'text-fpl-green',
      bg: 'bg-fpl-green/10',
      border: 'border-fpl-green/20',
    },
    {
      title: 'Season Revenue',
      value: formatNPR(stats.totalDue),
      icon: TrendingUp,
      color: 'text-fpl-purple',
      bg: 'bg-fpl-purple/10',
      border: 'border-fpl-purple/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`p-6 rounded-2xl border ${card.border} ${card.bg} shadow-sm backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${card.color} opacity-80`}>
              {card.title}
            </span>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <div className="text-3xl font-black text-fpl-dark-purple tracking-tight">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
