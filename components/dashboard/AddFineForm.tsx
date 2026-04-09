'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Player, Gameweek } from '@/lib/db/schema';
import { Loader2, Plus } from 'lucide-react';

const schema = z.object({
  playerId: z.string().min(1, 'Select a player'),
  amount: z.number().min(0, 'Amount must be positive'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddFineFormProps {
  players: Player[];
  gameweekId: number;
  onSuccess: () => void;
  password?: string;
}

export default function AddFineForm({ players, gameweekId, onSuccess, password }: AddFineFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 100,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ 
          action: 'ADD_FINE', 
          data: { 
            ...data, 
            playerId: parseInt(data.playerId),
            gameweekId 
          } 
        }),
      });

      if (!res.ok) throw new Error('Failed to add fine');
      reset();
      onSuccess();
    } catch (err) {
      alert('Error adding fine. Check password or permissions.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex items-center space-x-2 mb-2">
        <Plus className="w-4 h-4 text-fpl-purple" />
        <h3 className="text-xs font-black uppercase tracking-widest text-fpl-purple">Log New Fine</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Player</label>
          <select 
            {...register('playerId')}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none"
          >
            <option value="">Select Player</option>
            {players.map(p => (
              <option key={p.id} value={p.id.toString()}>{p.name}</option>
            ))}
          </select>
          {errors.playerId && <p className="text-[10px] text-fpl-pink font-bold mt-1">{errors.playerId.message}</p>}
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Amount (रू)</label>
          <input 
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none"
          />
          {errors.amount && <p className="text-[10px] text-fpl-pink font-bold mt-1">{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Reason</label>
        <input 
          type="text"
          {...register('reason')}
          placeholder="e.g. Missing Team Sheet"
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none"
        />
        {errors.reason && <p className="text-[10px] text-fpl-pink font-bold mt-1">{errors.reason.message}</p>}
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Remarks (Optional)</label>
        <textarea 
          {...register('remarks')}
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-fpl-purple/20 outline-none h-20"
        />
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-fpl-purple text-white font-black py-3 rounded-xl hover:bg-fpl-dark-purple transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Record Fine</span>}
      </button>
    </form>
  );
}
