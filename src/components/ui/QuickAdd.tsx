import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TransactionType } from '../../types';
import { colorMap } from '../../utils/colors';

export function QuickAdd() {
  const { categories, accounts, addTransaction } = useStore();
  const [open, setOpen]           = useState(false);
  const [type, setType]           = useState<TransactionType>('expense');
  const [amount, setAmount]       = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [done, setDone]           = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-open from URL params (Apple Shortcut)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const a = params.get('a');
    if (q === 'expense' || q === 'income') {
      setType(q as TransactionType);
      if (a) setAmount(a);
      setOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const cats = categories.filter(c => c.type === type || c.type === 'both');
  const isExpense = type === 'expense';
  const accentColor = isExpense ? '#FF3B30' : '#30D158';

  useEffect(() => {
    if (cats.length > 0) setCategoryId(cats[0].id);
  }, [type]);

  useEffect(() => {
    if (open) {
      setCategoryId(cats[0]?.id ?? '');
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      setAmount('');
      setDescription('');
      setAccountId('');
      setDone(false);
    }
  }, [open]);

  const canSubmit = amount && parseFloat(amount) > 0 && categoryId;

  const submit = () => {
    if (!canSubmit) return;
    addTransaction({
      type,
      amount: parseFloat(amount),
      description: description || (categories.find(c => c.id === categoryId)?.name ?? ''),
      categoryId,
      date: new Date().toISOString(),
      accountId: accountId || undefined,
    });
    setDone(true);
    setTimeout(() => setOpen(false), 700);
  };

  const pad = (v: string) => {
    if (v === '⌫') { setAmount(a => a.slice(0, -1)); return; }
    if (v === '.' && amount.includes('.')) return;
    if (amount.length >= 9) return;
    const [, dec] = (amount + v).split('.');
    if (dec && dec.length > 2) return;
    setAmount(a => a + v);
  };

  const PAD = [['1','2','3'],['4','5','6'],['7','8','9'],['.','0','⌫']];

  return (
    <>
      {/* FAB */}
      <motion.button
        className="md:hidden fixed z-40 w-14 h-14 rounded-full shadow-brand flex items-center justify-center"
        style={{
          bottom: 80,
          right: 16,
          background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)',
        }}
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.90 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.4 }}
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet — always dark like Revolut */}
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ backgroundColor: '#1C1C1E' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5856D6, #0A84FF)' }}>
                    <Zap size={13} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-base font-black text-white">Añadir movimiento</h2>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <X size={14} className="text-white/70" />
                </button>
              </div>

              {/* Type toggle */}
              <div className="px-5 mb-5">
                <div className="flex p-1 rounded-2xl gap-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  {(['expense','income'] as TransactionType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className="flex-1 py-3 rounded-xl text-sm font-black transition-all"
                      style={type === t ? {
                        backgroundColor: t === 'expense' ? '#FF3B30' : '#30D158',
                        color: 'white',
                      } : { color: 'rgba(255,255,255,0.45)' }}
                    >
                      {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount display */}
              <div className="px-5 mb-5">
                <p className="text-white/40 text-2xs font-bold uppercase tracking-widest mb-2 text-center">Importe</p>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-3xl font-light pb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>€</span>
                  <div
                    className="text-5xl font-black tracking-tight pb-1 border-b-2 min-w-[120px] flex items-end justify-center num-display"
                    style={{ color: amount ? 'white' : 'rgba(255,255,255,0.25)', borderColor: accentColor }}
                  >
                    {amount || '0'}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="px-5 mb-4">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {cats.map(cat => {
                    const c = colorMap[cat.color];
                    const sel = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all"
                        style={sel
                          ? { backgroundColor: c.hex, color: 'white' }
                          : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
                        }
                      >
                        <span>{cat.icon}</span>{cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description + account */}
              <div className="px-5 mb-4 flex gap-2">
                <input
                  ref={inputRef}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-white/30 text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
                  readOnly
                  onFocus={e => { e.target.readOnly = false; }}
                />
                {accounts.length > 0 && (
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="rounded-xl px-3 py-2 text-xs font-medium text-white w-28"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="">Sin cuenta</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Numpad */}
              <div className="px-4 mb-3">
                <div className="grid grid-cols-3 gap-2">
                  {PAD.flat().map((k, i) => {
                    const isBack = k === '⌫';
                    return (
                      <motion.button
                        key={i}
                        onClick={() => pad(k)}
                        className="h-13 rounded-2xl text-lg font-black flex items-center justify-center transition-all"
                        style={{
                          height: 52,
                          backgroundColor: isBack ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                          color: isBack ? 'rgba(255,255,255,0.5)' : 'white',
                        }}
                        whileTap={{ scale: 0.9, backgroundColor: 'rgba(255,255,255,0.18)' }}
                      >
                        {k}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="px-4 pb-8">
                <motion.button
                  onClick={submit}
                  disabled={!canSubmit}
                  className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-black text-white transition-all"
                  style={{
                    backgroundColor: done ? '#30D158' : canSubmit ? accentColor : 'rgba(255,255,255,0.12)',
                    opacity: canSubmit ? 1 : 0.5,
                  }}
                  whileTap={canSubmit ? { scale: 0.97 } : {}}
                  animate={done ? { scale: [1, 1.03, 1] } : {}}
                >
                  {done
                    ? <><Check size={20} /> Guardado</>
                    : isExpense ? 'Registrar gasto' : 'Registrar ingreso'
                  }
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
