import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2 } from 'lucide-react';
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
      <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-lg border border-border">
        {(['expense', 'income'] as TransactionType[]).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`py-2 rounded-md text-sm font-medium transition-all ${
              type === t
                ? t === 'expense'
                  ? 'bg-down-light text-down shadow-sm'
                  : 'bg-up-light text-up shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="bg-surface border border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted mb-2 font-medium">Importe</p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl text-subtle">$</span>
          <input
            type="number" inputMode="decimal" placeholder="0.00"
            value={amount} onChange={e => setAmount(e.target.value)}
            className="text-3xl font-semibold bg-transparent text-ink w-48 text-center outline-none placeholder:text-border"
          />
        </div>
      </div>

      <Input label="Descripción" placeholder="¿En qué fue?" value={description} onChange={e => setDescription(e.target.value)} />

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {cats.map(cat => {
            const c = colorMap[cat.color];
            const sel = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
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

      {/* Account selector */}
      {accounts.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink">Cuenta (opcional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAccountId('')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                accountId === '' ? 'bg-brand-light border-brand/40 text-brand' : 'border-border bg-surface text-ink hover:bg-border/50'
              }`}
            >
              Sin cuenta
            </button>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setAccountId(acc.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  accountId === acc.id ? 'bg-brand-light border-brand/40 text-brand' : 'border-border bg-surface text-ink hover:bg-border/50'
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
        className={type === 'income' ? '!bg-up hover:!bg-green-700' : '!bg-down hover:!bg-red-700'}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-xl font-semibold text-ink">Movimientos</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Nuevo movimiento
        </Button>
      </div>

      <div className="px-6 md:px-8 space-y-4 pb-6">
        {/* Filters */}
        <Card padding className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Month */}
          <input
            type="month" value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="input-field md:w-44"
          />

          {/* Type filter */}
          <div className="flex gap-1 p-0.5 bg-surface border border-border rounded-lg">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterType === t ? 'bg-card text-ink shadow-sm border border-border' : 'text-muted hover:text-ink'
                }`}
              >
                {t === 'all' ? 'Todo' : t === 'income' ? 'Ingresos' : 'Gastos'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text" placeholder="Buscar..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </Card>

        {/* Summary pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ingresos', value: income, color: 'text-up', bg: 'bg-up-light' },
            { label: 'Gastos', value: expense, color: 'text-down', bg: 'bg-down-light' },
            { label: 'Neto', value: income - expense, color: income - expense >= 0 ? 'text-brand' : 'text-down', bg: income - expense >= 0 ? 'bg-brand-light' : 'bg-down-light' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
              <p className="text-xs text-muted font-medium mb-1">{s.label}</p>
              <p className={`text-base font-semibold tabular-nums ${s.color}`}>{formatCompact(s.value)}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {grouped.length === 0 ? (
          <Card padding className="flex flex-col items-center text-center py-16">
            <span className="text-4xl mb-3">📋</span>
            <p className="font-medium text-ink mb-1">Sin movimientos</p>
            <p className="text-sm text-muted">{search ? 'No hay resultados' : 'Registra tu primer movimiento'}</p>
          </Card>
        ) : (
          <Card>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_160px_120px_100px_40px] gap-4 px-5 py-2.5 border-b border-border bg-surface rounded-t-xl">
              <span className="text-2xs font-semibold text-subtle uppercase tracking-wider">Descripción</span>
              <span className="text-2xs font-semibold text-subtle uppercase tracking-wider">Categoría</span>
              <span className="text-2xs font-semibold text-subtle uppercase tracking-wider">Fecha</span>
              <span className="text-2xs font-semibold text-subtle uppercase tracking-wider text-right">Importe</span>
              <span />
            </div>

            {grouped.map(([date, txs]) => (
              <div key={date}>
                {/* Date group header */}
                <div className="px-5 py-2 bg-surface/50 border-b border-border">
                  <p className="text-2xs font-semibold text-subtle uppercase tracking-wider">
                    {formatDateShort(txs[0].date)}
                  </p>
                </div>

                {txs.map((tx, i) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const c = cat ? colorMap[cat.color] : colorMap.blue;
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      className={`flex md:grid md:grid-cols-[1fr_160px_120px_100px_40px] gap-3 md:gap-4 items-center px-5 py-3 hover:bg-surface transition-colors ${
                        i < txs.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      {/* Description */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                          style={{ backgroundColor: `${c.hex}15` }}
                        >
                          {cat?.icon ?? '💸'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{tx.description}</p>
                          {tx.note && <p className="text-xs text-subtle truncate">{tx.note}</p>}
                        </div>
                      </div>

                      {/* Category (desktop) */}
                      <div className="hidden md:block">
                        <span
                          className="badge"
                          style={{ backgroundColor: `${c.hex}12`, color: c.hex }}
                        >
                          {cat?.name ?? 'Sin categoría'}
                        </span>
                      </div>

                      {/* Date (desktop) */}
                      <p className="hidden md:block text-xs text-muted">{formatDateShort(tx.date)}</p>

                      {/* Amount */}
                      <p className={`text-sm font-semibold tabular-nums text-right ${tx.type === 'income' ? 'text-up' : 'text-down'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCompact(tx.amount)}
                      </p>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:text-down hover:bg-down-light transition-colors flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        className="md:hidden fixed bottom-20 right-5 w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-dropdown z-20"
        onClick={() => setShowAdd(true)}
      >
        <Plus size={22} className="text-white" />
      </button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nuevo movimiento">
        <AddForm onClose={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar movimiento">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" fullWidth onClick={() => { if (deleteId) deleteTransaction(deleteId); setDeleteId(null); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
