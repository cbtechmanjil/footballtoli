import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import { Settings, Users, ClipboardList, Database } from 'lucide-react';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  const navItems = [
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Position Pricing', href: '/admin/pricing', icon: Settings },
    { name: 'Batch Point Entry', href: '/admin/batch-entry', icon: ClipboardList },
    { name: 'Data Import (Excel)', href: '/admin/import', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Admin Panel</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-fpl-purple/5 hover:text-fpl-purple rounded-xl transition-all"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
