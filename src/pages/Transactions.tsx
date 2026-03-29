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
import { formatDateShort, formatCompact } from '../utils/format';
import { colorMap } from '../utils/colors';
import { format } from 'date-fns';

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const key = tx.date.split('T')[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function AddTransactionForm({ onClose }: { onClose: () => void }) {
  const { categories, addTransaction } = useStore();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const filteredCats = categories.filter((c) => c.type === type || c.type === 'both');

  const handleSubmit = () => {
    if (!amount || !description || !categoryId) return;
    addTransaction({
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      date: new Date(date + 'T12:00:00').toISOString(),
      note: note || undefined,
    });
    onClose();
  };

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl">
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              type === t
                ? t === 'expense'
                  ? 'bg-white dark:bg-[#1C1C1E] text-[#FF3B30] shadow-apple-sm'
                  : 'bg-white dark:bg-[#1C1C1E] text-[#34C759] shadow-apple-sm'
                : 'text-[#8E8E93]'
            }`}
          >
            {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl p-5 text-center">
        <p className="text-sm text-[#8E8E93] mb-2">Monto</p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-light text-[#8E8E93]">$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-4xl font-bold bg-transparent text-[#1C1C1E] dark:text-white w-full text-center outline-none placeholder:text-[#C7C7CC]"
          />
        </div>
      </div>

      {/* Description */}
      <Input
        label="Descripción"
        placeholder="¿En qué fue?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/80 px-1">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {filteredCats.map((cat) => {
            const colors = colorMap[cat.color];
            const selected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selected
                    ? `${colors.light} ${colors.text} ring-1 ring-current`
                    : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#3A3A3C] dark:text-[#EBEBF5]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date */}
      <Input
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Note */}
      <TextArea
        label="Nota (opcional)"
        placeholder="Detalles adicionales..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="pb-2">
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={!amount || !description || !categoryId}
          className={type === 'income' ? '!bg-[#34C759]' : '!bg-[#FF3B30]'}
        >
          <Plus size={18} />
          {type === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso'}
        </Button>
      </div>
    </div>
  );
}

export function Transactions() {
  const { transactions, categories, deleteTransaction } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      const txMonth = tx.date.slice(0, 7);
      if (txMonth !== filterMonth) return false;
      if (search) {
        const cat = categories.find((c) => c.id === tx.categoryId);
        const q = search.toLowerCase();
        return (
          tx.description.toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, categories, filterType, filterMonth, search]);

  const grouped = groupByDate(filtered);

  const monthIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight mb-4">
          Movimientos
        </h1>

        {/* Month picker */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-white dark:bg-[#1C1C1E] rounded-xl px-4 py-2.5 text-sm font-medium text-[#1C1C1E] dark:text-white appearance-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-xl p-1">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === t
                    ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white shadow-apple-sm'
                    : 'text-[#8E8E93]'
                }`}
              >
                {t === 'all' ? 'Todo' : t === 'income' ? 'Ingreso' : 'Gasto'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-[#34C759]/10 rounded-2xl px-4 py-3">
            <p className="text-xs text-[#34C759] font-medium mb-0.5">Ingresos</p>
            <p className="text-base font-bold text-[#34C759]">+{formatCompact(monthIncome)}</p>
          </div>
          <div className="flex-1 bg-[#FF3B30]/10 rounded-2xl px-4 py-3">
            <p className="text-xs text-[#FF3B30] font-medium mb-0.5">Gastos</p>
            <p className="text-base font-bold text-[#FF3B30]">-{formatCompact(monthExpense)}</p>
          </div>
          <div className={`flex-1 rounded-2xl px-4 py-3 ${monthIncome - monthExpense >= 0 ? 'bg-[#007AFF]/10' : 'bg-[#FF9500]/10'}`}>
            <p className={`text-xs font-medium mb-0.5 ${monthIncome - monthExpense >= 0 ? 'text-[#007AFF]' : 'text-[#FF9500]'}`}>Neto</p>
            <p className={`text-base font-bold ${monthIncome - monthExpense >= 0 ? 'text-[#007AFF]' : 'text-[#FF9500]'}`}>
              {formatCompact(monthIncome - monthExpense)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="Buscar movimientos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#1C1C1E] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
          />
        </div>
      </div>

      {/* Transactions list */}
      <div className="px-5 space-y-5">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <span className="text-5xl mb-4">📋</span>
            <p className="font-semibold text-[#1C1C1E] dark:text-white mb-2">Sin movimientos</p>
            <p className="text-sm text-[#8E8E93]">
              {search ? 'No se encontraron resultados' : 'Agrega tu primer movimiento'}
            </p>
          </div>
        ) : (
          grouped.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 px-1">
                {formatDateShort(txs[0].date)}
              </p>
              <Card className="divide-y divide-[#F2F2F7] dark:divide-[#2C2C2E]">
                {txs.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const colors = cat ? colorMap[cat.color] : colorMap.blue;
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      className="flex items-center gap-3 px-4 py-3.5"
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.light}`}>
                        <span className="text-xl">{cat?.icon ?? '💸'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1C1C1E] dark:text-white truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-[#8E8E93]">{cat?.name ?? 'Sin categoría'}</p>
                        {tx.note && (
                          <p className="text-xs text-[#8E8E93] italic mt-0.5 truncate">{tx.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            tx.type === 'income' ? 'text-[#34C759]' : 'text-[#FF3B30]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCompact(tx.amount)}
                        </span>
                        <button
                          onClick={() => setShowDeleteId(tx.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C7C7CC] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </Card>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#007AFF] rounded-full flex items-center justify-center shadow-apple-lg z-20"
        onClick={() => setShowAdd(true)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nuevo Movimiento">
        <AddTransactionForm onClose={() => setShowAdd(false)} />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!showDeleteId} onClose={() => setShowDeleteId(null)} title="Eliminar">
        <div className="px-5 py-4 space-y-4">
          <p className="text-[#3A3A3C] dark:text-[#EBEBF5]/80">
            ¿Estás seguro de que quieres eliminar este movimiento?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteId(null)}>Cancelar</Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (showDeleteId) deleteTransaction(showDeleteId);
                setShowDeleteId(null);
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
