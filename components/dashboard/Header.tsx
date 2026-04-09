'use client';

import { Layout, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-fpl-purple text-white py-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-fpl-purple via-fpl-purple/80 to-transparent z-0 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center relative z-10">
        <Link href="/" className="flex items-center space-x-3 group transition-transform hover:scale-105">
          <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:bg-fpl-green group-hover:border-fpl-green transition-colors">
            <Layout className="w-6 h-6 group-hover:text-fpl-purple transition-colors" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none uppercase italic">
              Football <span className="text-fpl-green">Toli</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fpl-green/80 mt-1">Season 2024/25</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {session?.user.role === 'admin' && (
            <Link 
              href="/admin/users" 
              className="hidden md:flex items-center space-x-2 bg-white/10 hover:bg-fpl-green hover:text-fpl-purple px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}

          {session ? (
            <div className="flex items-center space-x-3 bg-white/5 p-1.5 pr-4 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-fpl-green flex items-center justify-center text-fpl-purple font-black text-xs shadow-inner">
                {session.user.name?.[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{session.user.name}</div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-[9px] font-black uppercase tracking-widest text-fpl-pink hover:text-white transition-colors flex items-center"
                >
                  <LogOut className="w-2.5 h-2.5 mr-1" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login"
              className="bg-fpl-green text-fpl-purple px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-fpl-green/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
