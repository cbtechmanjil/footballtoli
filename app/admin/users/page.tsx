import { getDb } from '@/lib/db';
import { players, users } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import CreateUserForm from '@/components/admin/CreateUserForm';

export default async function UserManagementPage() {
  const db = getDb();
  
  // Players who don't have a user account yet
  const playersWithoutAcc = await db.select()
    .from(players)
    .leftJoin(users, eq(players.id, users.playerId))
    .where(isNull(users.id));

  const allUsers = await db.select().from(users).orderBy(users.role);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-fpl-purple mb-8">User Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Active Accounts</h2>
            <div className="space-y-3">
              {allUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.role} • {user.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-fpl-purple/10 text-fpl-purple' : 'bg-fpl-green/10 text-fpl-green'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Create New Player Login</h2>
            <CreateUserForm players={playersWithoutAcc.map(p => p.players)} />
          </div>
        </div>
      </div>
    </div>
  );
}
