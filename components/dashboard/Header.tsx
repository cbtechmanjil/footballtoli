import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-fpl-dark-purple text-white shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-fpl-green opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fpl-pink opacity-10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-fpl-green p-2 rounded-lg">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-fpl-dark-purple" 
              fill="currentColor"
            >
              <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
              FOOTBALL <span className="text-fpl-green italic">TOLI</span>
            </h1>
            <p className="text-xs text-white/60 font-medium tracking-widest uppercase">
              Financial Fair Play Manager
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center space-x-6 text-sm font-semibold uppercase tracking-wider">
          <a href="#" className="hover:text-fpl-green transition-colors">Dashboard</a>
          <a href="#" className="hover:text-fpl-green transition-colors">History</a>
          <a href="#" className="hover:text-fpl-green transition-colors opacity-50 cursor-not-allowed">Imports</a>
        </div>
      </div>
      
      {/* Accent gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-fpl-green via-fpl-pink to-fpl-purple"></div>
    </header>
  );
}
