import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Bell, Moon, Sun, Plus, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCompact, formatDateShort } from '../utils/format';
import { colorMap } from '../utils/colors';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

function useMonthStats() {
  const { transactions, categories } = useStore();
  return useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const monthTx = transactions.filter((tx) =>
      isWithinInterval(new Date(tx.date), { start, end })
    );
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    // expenses by category
    const byCat: Record<string, number> = {};
    monthTx.filter((t) => t.type === 'expense').forEach((t) => {
      byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount;
    });
    const topCategories = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, amount]) => ({
        category: categories.find((c) => c.id === id),
        amount,
        pct: expense > 0 ? (amount / expense) * 100 : 0,
      }))
      .filter((x) => x.category);

    return { income, expense, balance, topCategories, monthTx };
  }, [transactions, categories]);
}

export function Dashboard() {
  const { isDark, toggleDark, transactions, categories, savingGoals, debts, setActiveTab } = useStore();
  const [hideBalance, setHideBalance] = useState(false);
  const stats = useMonthStats();

  const recentTx = transactions.slice(0, 5);
  const totalBalance = transactions.reduce((s, t) =>
    t.type === 'income' ? s + t.amount : s - t.amount, 0
  );

  const monthName = format(new Date(), 'MMMM yyyy', { locale: es });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const activeGoals = savingGoals.filter(g => g.currentAmount < g.targetAmount).slice(0, 2);
  const activeDebts = debts.filter(d => d.remainingAmount > 0).slice(0, 2);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#8E8E93] font-medium">{capitalizedMonth}</p>
          <h1 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Mi Finanzas
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2C2C2E] shadow-apple-sm"
          >
            {isDark ? <Sun size={18} className="text-[#FFCC00]" /> : <Moon size={18} className="text-[#8E8E93]" />}
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2C2C2E] shadow-apple-sm relative">
            <Bell size={18} className="text-[#8E8E93]" />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-5 mb-5">
        <motion.div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 50%, #1a1a2e 100%)',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#007AFF]/20 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-[#AF52DE]/20 translate-y-1/3 -translate-x-1/4" />

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/60 text-sm font-medium">Balance Total</p>
              <button onClick={() => setHideBalance(!hideBalance)}>
                {hideBalance
                  ? <EyeOff size={16} className="text-white/40" />
                  : <Eye size={16} className="text-white/40" />}
              </button>
            </div>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-bold text-white tracking-tight">
                {hideBalance ? '••••••' : formatCompact(totalBalance)}
              </span>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#34C759]/20 flex items-center justify-center">
                    <TrendingUp size={12} className="text-[#34C759]" />
                  </div>
                  <span className="text-white/60 text-xs">Ingresos</span>
                </div>
                <p className="text-white font-semibold text-base">
                  {hideBalance ? '••••' : formatCompact(stats.income)}
                </p>
              </div>
              <div className="flex-1 bg-white/10 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#FF3B30]/20 flex items-center justify-center">
                    <TrendingDown size={12} className="text-[#FF3B30]" />
                  </div>
                  <span className="text-white/60 text-xs">Gastos</span>
                </div>
                <p className="text-white font-semibold text-base">
                  {hideBalance ? '••••' : formatCompact(stats.expense)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Ingreso', icon: '↑', color: '#34C759', action: () => setActiveTab('transactions') },
            { label: 'Gasto', icon: '↓', color: '#FF3B30', action: () => setActiveTab('transactions') },
            { label: 'Ahorro', icon: '🎯', color: '#007AFF', action: () => setActiveTab('savings') },
            { label: 'Deuda', icon: '💳', color: '#AF52DE', action: () => setActiveTab('debts') },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileTap={{ scale: 0.93 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-apple-sm"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <span style={{ color: item.color }} className="text-xl font-bold">{item.icon}</span>
              </div>
              <span className="text-xs text-[#3A3A3C] dark:text-[#EBEBF5]/70 font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Top Spending Categories */}
      {stats.topCategories.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white">Principales Gastos</h2>
            <button onClick={() => setActiveTab('reports')} className="text-[#007AFF] text-sm font-medium">
              Ver todo
            </button>
          </div>
          <Card className="divide-y divide-[#F2F2F7] dark:divide-[#2C2C2E]">
            {stats.topCategories.map(({ category, amount, pct }, i) => {
              if (!category) return null;
              const colors = colorMap[category.color];
              return (
                <motion.div
                  key={category.id}
                  className="px-4 py-3.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.light}`}>
                      <span className="text-base">{category.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1E] dark:text-white">{category.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#FF3B30]">-{formatCompact(amount)}</span>
                  </div>
                  <ProgressBar value={pct} color={colors.hex} height={4} />
                </motion.div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Savings Goals Preview */}
      {activeGoals.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white">Metas de Ahorro</h2>
            <button onClick={() => setActiveTab('savings')} className="text-[#007AFF] text-sm font-medium">
              Ver todo
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {activeGoals.map((goal, i) => {
              const colors = colorMap[goal.color];
              const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors.light}`}>
                        <span className="text-xl">{goal.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1C1C1E] dark:text-white text-sm">{goal.name}</p>
                        <p className="text-xs text-[#8E8E93]">
                          {formatCompact(goal.currentAmount)} de {formatCompact(goal.targetAmount)}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${colors.text}`}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={colors.hex} />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Debts Preview */}
      {activeDebts.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white">Deudas Activas</h2>
            <button onClick={() => setActiveTab('debts')} className="text-[#007AFF] text-sm font-medium">
              Ver todo
            </button>
          </div>
          <Card className="divide-y divide-[#F2F2F7] dark:divide-[#2C2C2E]">
            {activeDebts.map((debt) => {
              const colors = colorMap[debt.color];
              const paidPct = Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100);
              return (
                <div key={debt.id} className="px-4 py-3.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.light}`}>
                      <span className="text-base">{debt.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1E] dark:text-white">{debt.name}</p>
                      <p className="text-xs text-[#8E8E93]">{debt.creditor}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#FF3B30]">
                      {formatCompact(debt.remainingAmount)}
                    </span>
                  </div>
                  <ProgressBar value={paidPct} color={colors.hex} height={4} />
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-white">Recientes</h2>
            <button onClick={() => setActiveTab('transactions')} className="text-[#007AFF] text-sm font-medium">
              Ver todo
            </button>
          </div>
          <Card className="divide-y divide-[#F2F2F7] dark:divide-[#2C2C2E]">
            {recentTx.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const colors = cat ? colorMap[cat.color] : colorMap.blue;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.light}`}>
                    <span className="text-xl">{cat?.icon ?? '💸'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1E] dark:text-white truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[#8E8E93]">{cat?.name} · {formatDateShort(tx.date)}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-[#34C759]' : 'text-[#FF3B30]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCompact(tx.amount)}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Empty state */}
      {transactions.length === 0 && (
        <div className="px-5 mt-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#007AFF]/10 flex items-center justify-center mb-4">
            <span className="text-4xl">💰</span>
          </div>
          <h3 className="font-semibold text-[#1C1C1E] dark:text-white text-lg mb-2">
            Bienvenido a Mi Finanzas
          </h3>
          <p className="text-[#8E8E93] text-sm max-w-xs mb-6">
            Empieza registrando tu primer ingreso o gasto para tomar control de tus finanzas.
          </p>
          <motion.button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-2 bg-[#007AFF] text-white px-6 py-3 rounded-2xl font-semibold"
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={18} />
            Agregar movimiento
          </motion.button>
        </div>
      )}
    </PageWrapper>
  );
}
