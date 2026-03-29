import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, Eye, EyeOff, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { formatCompact, formatDateShort, percentage } from '../utils/format';
import { colorMap } from '../utils/colors';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function useStats() {
  const { transactions, categories } = useStore();
  return useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const monthTx = transactions.filter(tx => isWithinInterval(new Date(tx.date), { start, end }));
    const income  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Last 6 months chart data
    const chartData = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const s = startOfMonth(d);
      const e = endOfMonth(d);
      const txs = transactions.filter(tx => isWithinInterval(new Date(tx.date), { start: s, end: e }));
      return {
        month: MONTH_ABBR[d.getMonth()],
        ingresos: txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        gastos: txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      };
    });

    const byCat: Record<string, number> = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount;
    });
    const topCategories = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, amount]) => ({
        category: categories.find(c => c.id === id),
        amount,
        pct: expense > 0 ? (amount / expense) * 100 : 0,
      })).filter(x => x.category);

    return { income, expense, balance: income - expense, chartData, topCategories, monthTx };
  }, [transactions, categories]);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-dropdown px-3 py-2 text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {payload.map((e: any) => (
        <p key={e.name} style={{ color: e.color }}>
          {e.name === 'ingresos' ? 'Ingresos' : 'Gastos'}: {formatCompact(e.value)}
        </p>
      ))}
    </div>
  );
}

export function Dashboard() {
  const { transactions, categories, savingGoals, debts, setActiveTab } = useStore();
  const [hide, setHide] = useState(false);
  const stats = useStats();

  const totalBalance = transactions.reduce((s, t) =>
    t.type === 'income' ? s + t.amount : s - t.amount, 0);

  const recentTx = transactions.slice(0, 6);
  const activeGoals = savingGoals.filter(g => g.currentAmount < g.targetAmount).slice(0, 4);
  const activeDebts = debts.filter(d => d.remainingAmount > 0).slice(0, 3);

  const monthLabel = format(new Date(), 'MMMM yyyy', { locale: es });

  const kpis = [
    {
      label: 'Balance total',
      value: totalBalance,
      icon: TrendingUp,
      color: totalBalance >= 0 ? '#16A34A' : '#DC2626',
      bg: totalBalance >= 0 ? '#F0FDF4' : '#FEF2F2',
      trend: null,
    },
    {
      label: 'Ingresos del mes',
      value: stats.income,
      icon: ArrowUpRight,
      color: '#16A34A',
      bg: '#F0FDF4',
      trend: null,
    },
    {
      label: 'Gastos del mes',
      value: stats.expense,
      icon: ArrowDownRight,
      color: '#DC2626',
      bg: '#FEF2F2',
      trend: null,
    },
    {
      label: 'Neto del mes',
      value: stats.balance,
      icon: stats.balance >= 0 ? TrendingUp : TrendingDown,
      color: stats.balance >= 0 ? '#4F46E5' : '#DC2626',
      bg: stats.balance >= 0 ? '#EEF2FF' : '#FEF2F2',
      trend: null,
    },
  ];

  return (
    <PageWrapper>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-8 pt-6 pb-5">
        <div>
          <p className="text-xs text-muted font-medium uppercase tracking-wider mb-0.5">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </p>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        </div>
        <Button onClick={() => setActiveTab('transactions')}>
          <Plus size={15} />
          Nuevo movimiento
        </Button>
      </div>

      <div className="px-6 md:px-8 space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card padding>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted">{k.label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.bg }}>
                    <k.icon size={14} style={{ color: k.color }} strokeWidth={2} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold text-ink tracking-tight">
                    {hide ? '•••' : formatCompact(k.value)}
                  </p>
                  {i === 0 && (
                    <button onClick={() => setHide(!hide)} className="text-subtle hover:text-muted transition-colors">
                      {hide ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Chart */}
          <Card className="md:col-span-2 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Ingresos vs Gastos</h2>
              <span className="text-xs text-subtle">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.10} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ingresos" stroke="#16A34A" strokeWidth={2} fill="url(#gi)" dot={false} />
                <Area type="monotone" dataKey="gastos" stroke="#DC2626" strokeWidth={2} fill="url(#gg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-up" />
                <span className="text-xs text-muted">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-down" />
                <span className="text-xs text-muted">Gastos</span>
              </div>
            </div>
          </Card>

          {/* Top categories */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Top Gastos</h2>
              <button onClick={() => setActiveTab('reports')} className="text-xs text-brand font-medium hover:underline">Ver informe</button>
            </div>
            {stats.topCategories.length === 0 ? (
              <p className="text-xs text-subtle text-center py-8">Sin gastos este mes</p>
            ) : (
              <div className="space-y-3">
                {stats.topCategories.map(({ category, amount, pct }) => {
                  if (!category) return null;
                  const c = colorMap[category.color];
                  return (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{category.icon}</span>
                          <span className="text-xs font-medium text-ink">{category.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-down">{formatCompact(amount)}</span>
                      </div>
                      <ProgressBar value={pct} color={c.hex} height={3} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Bottom grid */}
        <div className="grid md:grid-cols-3 gap-5 pb-6">
          {/* Recent transactions */}
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="section-title">Movimientos recientes</h2>
              <button onClick={() => setActiveTab('transactions')} className="btn-ghost flex items-center gap-1 text-xs">
                Ver todos <ChevronRight size={12} />
              </button>
            </div>
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="text-3xl mb-3">📋</span>
                <p className="text-sm text-muted">Sin movimientos aún</p>
                <button onClick={() => setActiveTab('transactions')} className="mt-3 text-xs text-brand font-medium hover:underline">
                  Agregar primero
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentTx.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  return (
                    <div key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 text-base">
                        {cat?.icon ?? '💸'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{tx.description}</p>
                        <p className="text-xs text-muted">{cat?.name} · {formatDateShort(tx.date)}</p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums ${tx.type === 'income' ? 'text-up' : 'text-down'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCompact(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Savings */}
            {activeGoals.length > 0 && (
              <Card>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h2 className="section-title">Ahorros</h2>
                  <button onClick={() => setActiveTab('savings')} className="text-xs text-brand font-medium hover:underline">Ver todo</button>
                </div>
                <div className="p-4 space-y-3">
                  {activeGoals.map(goal => {
                    const pct = percentage(goal.currentAmount, goal.targetAmount);
                    const c = colorMap[goal.color];
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{goal.icon}</span>
                            <span className="text-xs font-medium text-ink">{goal.name}</span>
                          </div>
                          <span className="text-xs text-muted tabular-nums">{pct}%</span>
                        </div>
                        <ProgressBar value={pct} color={c.hex} height={3} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Debts */}
            {activeDebts.length > 0 && (
              <Card>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h2 className="section-title">Deudas</h2>
                  <button onClick={() => setActiveTab('debts')} className="text-xs text-brand font-medium hover:underline">Ver todo</button>
                </div>
                <div className="divide-y divide-border">
                  {activeDebts.map(debt => (
                    <div key={debt.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-base">{debt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{debt.name}</p>
                        <p className="text-2xs text-subtle">{debt.creditor}</p>
                      </div>
                      <span className="text-xs font-semibold text-down tabular-nums">{formatCompact(debt.remainingAmount)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Empty right panel */}
            {activeGoals.length === 0 && activeDebts.length === 0 && (
              <Card padding className="flex flex-col items-center text-center py-8">
                <span className="text-3xl mb-2">🎯</span>
                <p className="text-xs text-muted">Crea metas de ahorro o registra deudas.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
