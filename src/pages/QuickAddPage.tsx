import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TransactionType, Category } from '../types';

interface Props {
  token: string;
  defaultType?: TransactionType;
}

export function QuickAddPage({ token, defaultType = 'expense' }: Props) {
  const [type, setType]           = useState<TransactionType>(defaultType);
  const [amount, setAmount]       = useState('');
  const [catId, setCatId]         = useState('');
  const [note, setNote]           = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [_accountId, setAccountId] = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);
  const amountRef                 = useRef<HTMLInputElement>(null);

  // Load user data via token — no auth session needed
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error: rpcErr } = await supabase.rpc('get_quick_add_data', {
        p_token: token,
      });
      if (rpcErr || !data || data.error) {
        setError('Token inválido. Genera uno nuevo desde la app.');
        setLoading(false);
        return;
      }
      setCategories(data.categories ?? []);
      setAccountId(data.account_id ?? '');
      setLoading(false);
      setTimeout(() => amountRef.current?.focus(), 150);
    };
    load();
  }, [token]);

  useEffect(() => { setCatId(''); }, [type]);

  const filtered = categories.filter(c => c.type === type || c.type === 'both');

  const submit = async () => {
    if (!amount || !catId || saving) return;
    setSaving(true);
    const cat = categories.find(c => c.id === catId);
    const { data: result } = await supabase.rpc('quick_add_transaction', {
      p_token:       token,
      p_amount:      amount,
      p_type:        type,
      p_category:    cat?.name ?? catId,
      p_description: note || cat?.name || '',
      p_date:        new Date().toISOString().split('T')[0],
    });
    if (result?.ok) {
      setDone(true);
      setTimeout(() => {
        setAmount(''); setCatId(''); setNote('');
        setDone(false); setSaving(false);
        amountRef.current?.focus();
      }, 1600);
    } else {
      setSaving(false);
      setError('Error al guardar. Comprueba tu conexión.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // ── Token inválido ──────────────────────────────────────────────────────
  if (!loading && error && !done) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ background: '#0A0A0A' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
          <AlertCircle size={26} className="text-red-400" />
        </div>
        <p className="text-white font-bold text-base">Enlace caducado</p>
        <p className="text-white/40 text-sm leading-relaxed max-w-xs">{error}</p>
        <a
          href="/Finanzas_personales_v1_2026/"
          className="mt-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
        >
          Abrir FinanzApp
        </a>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
          >
            <Zap size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/30"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
          >
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-sm">FinanzApp</span>
        </div>
        <a
          href="/Finanzas_personales_v1_2026/"
          className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
        >
          <ArrowLeft size={15} className="text-white/50" />
        </a>
      </div>

      {/* Type toggle */}
      <div className="px-5 mt-4 mb-5">
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
                  ? 'linear-gradient(135deg,#FF3B30,#FF6969)'
                  : 'linear-gradient(135deg,#30D158,#34C759)',
              } : {}}
            >
              {t === 'expense' ? '💸 Gasto' : '💰 Ingreso'}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="px-5 mb-5">
        <div
          className="rounded-3xl p-5 flex items-center gap-2"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-white/25 text-4xl font-light select-none">€</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 bg-transparent text-white text-4xl font-bold outline-none placeholder:text-white/12 min-w-0"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-5">
        <p className="text-2xs text-white/25 font-semibold uppercase tracking-widest mb-3">Categoría</p>
        <div className="grid grid-cols-4 gap-2">
          {filtered.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCatId(cat.id)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all active:scale-95"
              style={{
                background: catId === cat.id ? 'rgba(10,132,255,0.18)' : 'rgba(255,255,255,0.05)',
                border: catId === cat.id ? '1.5px solid rgba(10,132,255,0.5)' : '1.5px solid transparent',
              }}
            >
              <span className="text-2xl leading-none">{cat.icon}</span>
              <span className="text-2xs text-white/55 font-medium text-center leading-tight line-clamp-1 w-full">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="px-5 mb-5">
        <input
          type="text"
          placeholder="Nota (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full bg-transparent text-white/70 text-sm outline-none placeholder:text-white/20 px-4 py-3.5 rounded-2xl"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.06)' }}
        />
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-5 mb-3 px-4 py-2.5 rounded-2xl text-sm text-red-400 font-medium"
            style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.25)' }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div className="px-5 mt-auto pb-10">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#30D158,#34C759)' }}
            >
              <Check size={20} className="text-white" strokeWidth={3} />
              <span className="text-white font-bold text-base">¡Guardado!</span>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={submit}
              disabled={!amount || !catId || saving}
              className="w-full py-4 rounded-2xl font-bold text-base text-white disabled:opacity-30 transition-opacity active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#5856D6,#0A84FF)' }}
            >
              {saving ? 'Guardando…' : `Añadir ${type === 'expense' ? 'gasto' : 'ingreso'}`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
