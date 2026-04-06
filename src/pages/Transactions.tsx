import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Transaction, TransactionType } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, TextArea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatCompact, formatDateShort } from '../utils/format';
import { colorMap } from '../utils/colors';
import { format } from 'date-fns';

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(tx => {
    const key = tx.date.split('T')[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function AddForm({ onClose }: { onClose: () => void }) {
  const { categories, accounts, addTransaction } = useStore();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const cats = categories.filter(c => c.type === type || c.type === 'both');
  const isExpense = type === 'expense';

  const submit = () => {
    if (!amount || !description || !categoryId) return;
    addTransaction({
      type, amount: parseFloat(amount), description, categoryId,
      date: new Date(date + 'T12:00:00').toISOString(),
      note: note || undefined,
      accountId: accountId || undefined,
    });
    onClose();
  };

  return (
    <div className="p-5 space-y-4">
      {/* Type toggle */}
      <div className="flex p-1.5 bg-surface rounded-2xl border border-border gap-1.5">
        {(['expense', 'income'] as TransactionType[]).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              type === t
                ? t === 'expense'
                  ? 'bg-down text-white shadow-sm'
                  : 'bg-up text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: isExpense ? 'rgba(255,59,48,0.04)' : 'rgba(48,209,88,0.04)' }}>
        <div className="px-4 py-4 text-center">
          <p className="text-2xs font-bold text-muted uppercase tracking-widest mb-2">Importe</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl text-muted font-light">€</span>
            <input
              type="number" inputMode="decimal" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="text-4xl font-black bg-transparent text-ink w-44 text-center outline-none placeholder:text-border num-display"
            />
          </div>
        </div>
      </div>

      <Input label="Descripción" placeholder="¿En qué fue?" value={description} onChange={e => setDescription(e.target.value)} />

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {cats.map(cat => {
            const c = colorMap[cat.color];
            const sel = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sel ? 'border-transparent' : 'border-border bg-surface text-ink hover:bg-border/50'
                }`}
                style={sel ? { backgroundColor: `${c.hex}15`, borderColor: `${c.hex}40`, color: c.hex } : {}}
              >
                <span>{cat.icon}</span>{cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Account */}
      {accounts.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink">Cuenta</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAccountId('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                accountId === '' ? 'bg-brand-light border-brand/30 text-brand' : 'border-border bg-surface text-muted'
              }`}
            >Sin cuenta</button>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setAccountId(acc.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  accountId === acc.id ? 'bg-brand-light border-brand/30 text-brand' : 'border-border bg-surface text-muted'
                }`}
              >
                <span>{acc.icon}</span>{acc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <TextArea label="Nota (opcional)" placeholder="Detalles adicionales..." value={note} onChange={e => setNote(e.target.value)} />

      <Button
        fullWidth size="lg" onClick={submit}
        disabled={!amount || !description || !categoryId}
        className={type === 'income' ? '!bg-up hover:!bg-green-600' : '!bg-down hover:!bg-red-600'}
      >
        <Plus size={16} />
        {type === 'expense' ? 'Registrar gasto' : 'Registrar ingreso'}
      </Button>
    </div>
  );
}

export function Transactions() {
  const { transactions, categories, deleteTransaction } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (tx.date.slice(0, 7) !== filterMonth) return false;
      if (search) {
        const cat = categories.find(c => c.id === tx.categoryId);
        const q = search.toLowerCase();
        return tx.description.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [transactions, categories, filterType, filterMonth, search]);

  const grouped = groupByDate(filtered);
  const income  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-2xl font-black text-ink">Movimientos</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Nuevo movimiento
        </Button>
      </div>

      <div className="px-4 md:px-8 space-y-4 pb-8">
        {/* Summary pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ingresos', value: income, Icon: ArrowUpRight, color: 'text-up', bg: 'rgba(48,209,88,0.10)' },
            { label: 'Gastos',   value: expense, Icon: ArrowDownRight, color: 'text-down', bg: 'rgba(255,59,48,0.08)' },
            { label: 'Neto',     value: income - expense, Icon: income - expense >= 0 ? ArrowUpRight : ArrowDownRight,
              color: income - expense >= 0 ? 'text-brand' : 'text-down',
              bg: income - expense >= 0 ? 'rgba(10,132,255,0.08)' : 'rgba(255,59,48,0.08)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-3" style={{ backgroundColor: s.bg }}>
              <div className="flex items-center gap-1 mb-1">
                <s.Icon size={11} className={s.color} strokeWidth={2.5} />
                <p className="text-2xs text-muted font-bold uppercase tracking-wide">{s.label}</p>
              </div>
              <p className={`text-base font-black num-display ${s.color}`}>{formatCompact(s.value)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card padding>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="month" value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="input-field md:w-44"
            />
            <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === t ? 'bg-card text-ink shadow-sm border border-border' : 'text-muted hover:text-ink'
                  }`}
                >
                  {t === 'all' ? 'Todo' : t === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="text" placeholder="Buscar..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>
        </Card>

        {/* Transactions list */}
        {grouped.length === 0 ? (
          <Card padding className="flex flex-col items-center text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-bold text-ink mb-1">Sin movimientos</p>
            <p className="text-sm text-muted">{search ? 'No hay resultados' : 'Registra tu primer movimiento'}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, txs]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <p className="text-2xs font-bold text-muted uppercase tracking-widest">
                    {formatDateShort(txs[0].date)}
                  </p>
                  <div className="flex-1 h-px bg-border" />
                  <p className="text-2xs font-bold text-muted num-display">
                    {txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0) >= 0 ? '+' : ''}
                    {formatCompact(txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0))}
                  </p>
                </div>

                <Card>
                  <div className="divide-y divide-border">
                    {txs.map((tx) => {
                      const cat = categories.find(c => c.id === tx.categoryId);
                      const c = cat ? colorMap[cat.color] : colorMap.blue;
                      const isIncome = tx.type === 'income';
                      return (
                        <motion.div
                          key={tx.id}
                          layout
                          className="flex items-center gap-4 px-5 py-4 hover:bg-surface transition-colors"
                        >
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                            style={{ backgroundColor: isIncome ? 'rgba(48,209,88,0.12)' : 'rgba(255,59,48,0.10)' }}
                          >
                            {cat?.icon ?? '💸'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{tx.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="badge"
                                style={{ backgroundColor: `${c.hex}12`, color: c.hex }}
                              >
                                {cat?.name ?? 'Sin categoría'}
                              </span>
                              <span className="text-2xs text-muted">{formatDateShort(tx.date)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`text-base font-black num-display ${isIncome ? 'text-up' : 'text-down'}`}>
                              {isIncome ? '+' : '-'}{formatCompact(tx.amount)}
                            </p>
                            <button
                              onClick={() => setDeleteId(tx.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-subtle hover:text-down hover:bg-down-light transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nuevo movimiento">
        <AddForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar movimiento">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { if (deleteId) { deleteTransaction(deleteId); setDeleteId(null); } }}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
