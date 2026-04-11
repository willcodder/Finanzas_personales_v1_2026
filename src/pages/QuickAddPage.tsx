import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import type { TransactionType } from '../types';

interface Props {
  defaultType?: TransactionType;
}

export function QuickAddPage({ defaultType = 'expense' }: Props) {
  const { categories, accounts, addTransaction, loadCloudData } = useStore();
  const { user } = useAuthStore();

  const [amount, setAmount]     = useState('');
  const [type, setType]         = useState<TransactionType>(defaultType);
  const [catId, setCatId]       = useState('');
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const amountRef               = useRef<HTMLInputElement>(null);

  // Load user data from Supabase if not already loaded
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', user.id)
        .single();
      if (data?.data && Object.keys(data.data).length > 0) {
        loadCloudData(data.data);
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Auto-focus amount
  useEffect(() => {
    if (loaded) setTimeout(() => amountRef.current?.focus(), 100);
  }, [loaded]);

  // Reset category when type changes
  useEffect(() => { setCatId(''); }, [type]);

  const filteredCats = categories.filter(c => c.type === type || c.type === 'both');
  const firstAccount = accounts[0];

  const handleSubmit = async () => {
    if (!amount || !catId || saving) return;
    setSaving(true);
    addTransaction({
      type,
      amount: parseFloat(amount),
      categoryId: catId,
      description: note || (filteredCats.find(c => c.id === catId)?.name ?? ''),
      date: new Date().toISOString().split('T')[0],
      accountId: firstAccount?.id,
    });
    // Sync to cloud
    await new Promise(r => setTimeout(r, 400));
    const state = useStore.getState();
    await supabase.from('user_data').upsert({
      user_id: user!.id,
      data: {
        accounts: state.accounts,
        categories: state.categories,
        transactions: state.transactions,
        savingGoals: state.savingGoals,
        debts: state.debts,
        budgets: state.budgets,
        debtors: state.debtors,
      },
      updated_at: new Date().toISOString(),
    });
    setDone(true);
    setTimeout(() => {
      setAmount(''); setNote(''); setCatId(''); setDone(false); setSaving(false);
      amountRef.current?.focus();
    }, 1800);
  };

  // Not logged in
  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ background: '#0A0A0A' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
        >
          <Zap size={26} className="text-white" strokeWidth={2.5} />
        </div>
        <p className="text-white font-bold text-lg">FinanzApp</p>
        <p className="text-white/40 text-sm">Inicia sesión en la app principal primero.</p>
        <a
          href="/Finanzas_personales_v1_2026/"
          className="mt-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
        >
          Ir a la app
        </a>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0A0A0A' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
          >
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-sm">Añadir rápido</span>
        </div>
        <a
          href="/Finanzas_personales_v1_2026/"
          className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
        >
          <ArrowLeft size={15} className="text-white/50" />
        </a>
      </div>

      {/* Type toggle */}
      <div className="px-5 mb-6">
        <div className="flex rounded-2xl p-1" style={{ background: '#1C1C1E' }}>
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === t ? 'text-white' : 'text-white/30'
              }`}
              style={type === t ? {
                background: t === 'expense'
                  ? 'linear-gradient(135deg,#FF3B30,#FF6B6B)'
                  : 'linear-gradient(135deg,#30D158,#34C759)',
              } : {}}
            >
              {t === 'expense' ? '💸 Gasto' : '💰 Ingreso'}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="px-5 mb-6">
        <div
          className="rounded-3xl p-5 flex items-center gap-3"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-white/30 text-4xl font-light">€</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-white text-4xl font-bold outline-none placeholder:text-white/15"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-6">
        <p className="text-xs text-white/25 font-semibold uppercase tracking-widest mb-3">Categoría</p>
        {!loaded ? (
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCatId(cat.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                  catId === cat.id ? 'ring-2 ring-brand' : ''
                }`}
                style={{
                  background: catId === cat.id
                    ? 'rgba(10,132,255,0.15)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-2xs text-white/60 font-medium text-center leading-tight line-clamp-1">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div className="px-5 mb-6">
        <input
          type="text"
          placeholder="Nota (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full bg-transparent text-white/70 text-sm outline-none placeholder:text-white/20 px-4 py-3 rounded-2xl"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
        />
      </div>

      {/* Submit */}
      <div className="px-5 mt-auto pb-10">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#30D158,#34C759)' }}
            >
              <Check size={20} className="text-white" strokeWidth={3} />
              <span className="text-white font-bold text-base">¡Guardado!</span>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={handleSubmit}
              disabled={!amount || !catId || saving}
              className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-30"
              style={{
                background: 'linear-gradient(135deg,#5856D6,#0A84FF)',
              }}
            >
              {saving ? 'Guardando...' : `Añadir ${type === 'expense' ? 'gasto' : 'ingreso'}`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
