'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GameweekSelectorProps {
  current: number;
  available: number[];
  onChange: (gw: number) => void;
}

export default function GameweekSelector({ current, available, onChange }: GameweekSelectorProps) {
  const currentIndex = available.indexOf(current);
  
  const handlePrev = () => {
    if (currentIndex < available.length - 1) {
      onChange(available[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      onChange(available[currentIndex - 1]);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
      <button 
        onClick={handlePrev}
        disabled={currentIndex >= available.length - 1}
        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="px-4 text-center">
        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Viewing</div>
        <div className="text-sm font-black text-fpl-purple leading-tight">Gameweek {current}</div>
      </div>

      <button 
        onClick={handleNext}
        disabled={currentIndex <= 0}
        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
