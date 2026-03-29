import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check } from 'lucide-react';
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

  // Auto-open from URL params (Apple Shortcut: ?q=expense&a=25)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const a = params.get('a');
    if (q === 'expense' || q === 'income') {
      setType(q as TransactionType);
      if (a) setAmount(a);
      setOpen(true);
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const cats = categories.filter(c => c.type === type || c.type === 'both');
  const isExpense = type === 'expense';
  const accentColor = isExpense ? '#DC2626' : '#16A34A';

  // Auto-select first category when type changes
  useEffect(() => {
    if (cats.length > 0) setCategoryId(cats[0].id);
  }, [type]);

  // Focus amount on open
  useEffect(() => {
    if (open) {
      setCategoryId(cats[0]?.id ?? '');
      setTimeout(() => inputRef.current?.focus(), 300);
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
    setTimeout(() => setOpen(false), 600);
  };

  // Number pad key
  const pad = (v: string) => {
    if (v === '⌫') {
      setAmount(a => a.slice(0, -1));
      return;
    }
    if (v === '.' && amount.includes('.')) return;
    if (amount.length >= 9) return;
    // Max 2 decimals
    const [, dec] = (amount + v).split('.');
    if (dec && dec.length > 2) return;
    setAmount(a => a + v);
  };

  const PAD = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['.','0','⌫'],
  ];

  return (
    <>
      {/* FAB — mobile only, above bottom nav */}
      <motion.button
        className="md:hidden fixed bottom-[72px] right-4 z-40 w-14 h-14 rounded-full bg-brand shadow-dropdown flex items-center justify-center"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.3 }}
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl overflow-hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-base font-semibold text-ink">Añadir movimiento</h2>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-surface flex items-center justify-center">
                  <X size={14} className="text-muted" />
                </button>
              </div>

              {/* Type toggle */}
              <div className="px-5 mb-4">
                <div className="flex p-1 bg-surface rounded-xl border border-border gap-1">
                  {(['expense','income'] as TransactionType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        type === t
                          ? t === 'expense'
                            ? 'bg-down text-white shadow-sm'
                            : 'bg-up text-white shadow-sm'
                          : 'text-muted'
                      }`}
                    >
                      {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount display */}
              <div className="px-5 mb-3 flex items-end gap-2">
                <span className="text-2xl font-light text-muted pb-0.5">€</span>
                <div
                  className="flex-1 text-4xl font-bold text-ink tracking-tight pb-1 border-b-2 min-h-[52px] flex items-end"
                  style={{ borderColor: accentColor }}
                >
                  {amount || <span className="text-subtle font-light">0</span>}
                </div>
              </div>

              {/* Category chips */}
              <div className="px-5 mb-3">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {cats.map(cat => {
                    const c = colorMap[cat.color];
                    const sel = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all border ${
                          sel ? 'border-transparent text-white' : 'border-border bg-surface text-muted'
                        }`}
                        style={sel ? { backgroundColor: c.hex } : {}}
                      >
                        <span>{cat.icon}</span>{cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description + account row */}
              <div className="px-5 mb-3 flex gap-2">
                <input
                  ref={inputRef}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-subtle"
                  readOnly
                  onFocus={e => { e.target.readOnly = false; }}
                />
                {accounts.length > 0 && (
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="bg-surface border border-border rounded-xl px-2 py-2 text-xs text-ink w-28"
                  >
                    <option value="">Sin cuenta</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Number pad */}
              <div className="px-4 mb-2">
                <div className="grid grid-cols-3 gap-2">
                  {PAD.flat().map((k, i) => {
                    const isBackspace = k === '⌫';
                    return (
                      <motion.button
                        key={i}
                        onClick={() => pad(k)}
                        className={`h-12 rounded-xl text-lg font-semibold flex items-center justify-center transition-colors ${
                          isBackspace
                            ? 'bg-surface text-muted text-base'
                            : 'bg-surface text-ink active:bg-border'
                        }`}
                        whileTap={{ scale: 0.93 }}
                      >
                        {k}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="px-4 pb-6 pt-1">
                <motion.button
                  onClick={submit}
                  disabled={!canSubmit}
                  className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold text-white transition-all ${
                    canSubmit ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{ backgroundColor: done ? '#16A34A' : accentColor }}
                  whileTap={canSubmit ? { scale: 0.97 } : {}}
                  animate={done ? { scale: [1, 1.04, 1] } : {}}
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
