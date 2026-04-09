import { getDb } from '@/lib/db';
import { priceList, seasons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export default async function PricingPage() {
  const db = getDb();
  
  // Get active season
  const [activeSeason] = await db.select().from(seasons).where(eq(seasons.status, 'active')).limit(1);
  
  const currentPrices = await db.select().from(priceList).where(eq(priceList.seasonId, activeSeason.id)).orderBy(priceList.position);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-fpl-purple">Position Pricing</h1>
        <p className="text-sm text-gray-500 font-medium">Define how much players pay based on their gameweek rank for {activeSeason.name}.</p>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Position</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount (NPR)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentPrices.map((price: any) => (
              <tr key={price.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-fpl-purple/10 text-fpl-purple font-black text-xs">
                    {price.position}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  रू {price.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <button className="text-[10px] font-black uppercase tracking-widest text-fpl-purple hover:text-fpl-pink transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {currentPrices.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm italic font-medium">
                  No pricing set for this season yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button className="bg-fpl-purple text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-fpl-purple/90 shadow-lg shadow-fpl-purple/20 transition-all active:scale-95">
          Add Position Rate
        </button>
      </div>
    </div>
  );
}
