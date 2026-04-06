import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownRight,
  ChevronRight, Zap, TrendingUp, TrendingDown, Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCompact, formatDateShort, percentage } from '../utils/format';
import { colorMap } from '../utils/colors';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function useStats() {
  const { transactions, categories } = useStore();
  return useMemo(() => {
    const now   = new Date();
    const start = startOfMonth(now);
    const end   = endOfMonth(now);
    const monthTx = transactions.filter(tx => isWithinInterval(new Date(tx.date), { start, end }));
    const income  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

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

    return { income, expense, balance: income - expense, chartData, topCategories };
  }, [transactions, categories]);
}

function useFinancialScore() {
  const { transactions, savingGoals, debts } = useStore();
  return useMemo(() => {
    const now   = new Date();
    const start = startOfMonth(now);
    const end   = endOfMonth(now);
    const monthTx = transactions.filter(tx => isWithinInterval(new Date(tx.date), { start, end }));
    const income  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    let score = 0;
    let savingsRate = 0;

    if (income > 0) {
      savingsRate = Math.max(0, (income - expense) / income);
      score += Math.min(40, Math.round((savingsRate / 0.2) * 40));
      score += expense <= income ? 30 : Math.max(0, 30 - Math.round(((expense - income) / income) * 30));
    } else {
      score += 35;
    }

    if (savingGoals.length > 0) score += 10;
    if (savingGoals.some(g => g.currentAmount >= g.targetAmount)) score += 5;

    const totalRemaining = debts.reduce((s, d) => s + d.remainingAmount, 0);
    if (totalRemaining === 0) {
      score += 15;
    } else if (income > 0) {
      const ratio = totalRemaining / (income * 12);
      if (ratio < 0.1)      score += 12;
      else if (ratio < 0.3) score += 8;
      else if (ratio < 0.5) score += 4;
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      savingsRatePct: Math.round(savingsRate * 100),
      debtFree: totalRemaining === 0,
    };
  }, [transactions, savingGoals, debts]);
}

function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 70 ? '#30D158' : score >= 40 ? '#FF9F0A' : '#FF3B30';
  const label = score >= 80 ? 'Excelente' : score >= 65 ? 'Muy buena' : score >= 50 ? 'Buena' : score >= 35 ? 'Regular' : 'Mejorar';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-ink num-display leading-none">{score}</span>
          <span className="text-2xs text-muted font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card-elevated border border-border rounded-2xl shadow-dropdown px-4 py-3 text-xs">
      <p className="font-bold text-ink mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-muted">{e.name === 'ingresos' ? 'Ingresos' : 'Gastos'}:</span>
          <span className="font-bold text-ink">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const { transactions, categories, savingGoals, debts, setActiveTab } = useStore();
  const [hide, setHide] = useState(false);
  const stats = useStats();
  const { score, savingsRatePct, debtFree } = useFinancialScore();

  const totalBalance = transactions.reduce((s, t) =>
    t.type === 'income' ? s + t.amount : s - t.amount, 0);

  const recentTx    = transactions.slice(0, 6);
  const activeGoals = savingGoals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3);
  const activeDebts = debts.filter(d => d.remainingAmount > 0).slice(0, 3);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const monthLabel = format(new Date(), 'MMMM yyyy', { locale: es });

  const stagger: Variants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 280 } },
  };

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="hidden" animate="show">

        {/* ── Hero balance card ──────────────────────────── */}
        <motion.div variants={fadeUp} className="px-4 md:px-8 pt-6 pb-2">
          <div
            className="relative rounded-3xl overflow-hidden p-6 md:p-8"
            style={{ background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 65%, #34C759 100%)' }}
          >
            <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full bg-white/8 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-white/70 text-sm font-medium">{greeting}</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                  <Sparkles size={11} className="text-white/80" />
                  <span className="text-white/80 text-2xs font-bold">Score {score}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-white/50 text-2xs font-bold uppercase tracking-widest mb-2">Balance Total</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl md:text-5xl font-black text-white num-display tracking-tight">
                    {hide ? '••••••' : formatCompact(totalBalance)}
                  </span>
                  <button
                    onClick={() => setHide(!hide)}
                    className="mb-2 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                  >
                    {hide ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Ingresos', value: stats.income,  Icon: ArrowUpRight,   color: '#34C759' },
                  { label: 'Gastos',   value: stats.expense, Icon: ArrowDownRight, color: '#FF6B6B' },
                  { label: 'Neto',     value: stats.balance, Icon: stats.balance >= 0 ? TrendingUp : TrendingDown, color: stats.balance >= 0 ? '#34C759' : '#FF6B6B' },
                ].map(k => (
                  <div key={k.label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.10)' }}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <k.Icon size={11} style={{ color: k.color }} strokeWidth={2.5} />
                      <span className="text-white/60 text-2xs font-bold">{k.label}</span>
                    </div>
                    <p className="text-white font-black text-sm num-display">
                      {hide ? '•••' : formatCompact(k.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="px-4 md:px-8 space-y-4 pb-8 pt-4">

          {/* ── Score + Chart grid ─────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={fadeUp}>
              <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center">
                <p className="section-title mb-5">Salud financiera</p>
                <ScoreRing score={score} />
                <div className="w-full mt-5 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xs text-muted mb-1">Ahorro</p>
                    <p className={`text-sm font-black num-display ${savingsRatePct >= 20 ? 'text-up' : savingsRatePct >= 10 ? 'text-warn' : 'text-down'}`}>
                      {savingsRatePct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-muted mb-1">Neto</p>
                    <p className={`text-sm font-black num-display ${stats.balance >= 0 ? 'text-up' : 'text-down'}`}>
                      {stats.balance >= 0 ? '+' : ''}{formatCompact(stats.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xs text-muted mb-1">Deudas</p>
                    <p className={`text-sm font-black ${debtFree ? 'text-up' : 'text-warn'}`}>
                      {debtFree ? '✓ Ok' : `${activeDebts.length}`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-5 h-full">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-ink text-sm">Ingresos vs Gastos</h2>
                  <span className="text-2xs text-muted bg-surface px-2.5 py-1 rounded-full font-medium">6 meses</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={stats.chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#30D158" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#30D158" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#FF3B30" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#FF3B30" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#8E8E93' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="ingresos" stroke="#30D158" strokeWidth={2.5} fill="url(#gi)" dot={false} />
                    <Area type="monotone" dataKey="gastos"   stroke="#FF3B30" strokeWidth={2.5} fill="url(#gg)"  dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-up" /><span className="text-2xs text-muted font-medium">Ingresos</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-down" /><span className="text-2xs text-muted font-medium">Gastos</span></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Recent transactions ────────────────────────── */}
          <motion.div variants={fadeUp}>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-bold text-ink text-sm">Movimientos recientes</h2>
                <button onClick={() => setActiveTab('transactions')} className="flex items-center gap-1 text-xs text-brand font-bold hover:opacity-70 transition-opacity">
                  Ver todos <ChevronRight size={13} />
                </button>
              </div>
              {recentTx.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mb-3">
                    <Zap size={22} className="text-brand" />
                  </div>
                  <p className="font-semibold text-ink text-sm mb-1">Sin movimientos aún</p>
                  <p className="text-xs text-muted">Añade tu primer ingreso o gasto</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentTx.map(tx => {
                    const cat = categories.find(c => c.id === tx.categoryId);
                    const isIncome = tx.type === 'income';
                    return (
                      <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                          style={{ backgroundColor: isIncome ? 'rgba(48,209,88,0.12)' : 'rgba(255,59,48,0.10)' }}
                        >
                          {cat?.icon ?? '💸'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{tx.description}</p>
                          <p className="text-xs text-muted">{cat?.name} · {formatDateShort(tx.date)}</p>
                        </div>
                        <span className={`text-sm font-black num-display ${isIncome ? 'text-up' : 'text-down'}`}>
                          {isIncome ? '+' : '-'}{formatCompact(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Bottom: Top spending + Goals/Debts ──────────── */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div variants={fadeUp}>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-ink text-sm">Top Gastos</h2>
                  <button onClick={() => setActiveTab('reports')} className="text-xs text-brand font-bold hover:opacity-70 transition-opacity">Informes</button>
                </div>
                {stats.topCategories.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">Sin gastos este mes</p>
                ) : (
                  <div className="space-y-4">
                    {stats.topCategories.map(({ category, amount, pct }) => {
                      if (!category) return null;
                      const c = colorMap[category.color];
                      return (
                        <div key={category.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ backgroundColor: `${c.hex}18` }}>
                                {category.icon}
                              </div>
                              <span className="text-sm font-semibold text-ink">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-down num-display">{formatCompact(amount)}</span>
                              <span className="text-2xs text-muted ml-1">{pct.toFixed(0)}%</span>
                            </div>
                          </div>
                          <ProgressBar value={pct} color={c.hex} height={3} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              {activeGoals.length > 0 && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="font-bold text-ink text-sm">Metas</h2>
                    <button onClick={() => setActiveTab('savings')} className="text-xs text-brand font-bold hover:opacity-70 transition-opacity">Ver todo</button>
                  </div>
                  <div className="px-5 pb-4 space-y-3">
                    {activeGoals.map(goal => {
                      const pct = percentage(goal.currentAmount, goal.targetAmount);
                      const c = colorMap[goal.color];
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{goal.icon}</span>
                              <span className="text-sm font-semibold text-ink truncate max-w-[120px]">{goal.name}</span>
                            </div>
                            <span className="text-xs font-bold text-muted num-display">{pct}%</span>
                          </div>
                          <ProgressBar value={pct} color={c.hex} height={4} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeDebts.length > 0 && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="font-bold text-ink text-sm">Deudas</h2>
                    <button onClick={() => setActiveTab('debts')} className="text-xs text-brand font-bold hover:opacity-70 transition-opacity">Ver todo</button>
                  </div>
                  <div className="divide-y divide-border">
                    {activeDebts.map(debt => (
                      <div key={debt.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-9 h-9 rounded-xl bg-down-light flex items-center justify-center text-base flex-shrink-0">{debt.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{debt.name}</p>
                          <p className="text-2xs text-muted">{debt.creditor}</p>
                        </div>
                        <span className="text-sm font-black text-down num-display">{formatCompact(debt.remainingAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeGoals.length === 0 && activeDebts.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mb-3 shadow-brand-sm">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-ink mb-1">Todo en orden</p>
                  <p className="text-xs text-muted">Crea metas o registra tus deudas</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Empty state */}
          {transactions.length === 0 && (
            <motion.div variants={fadeUp}>
              <div
                className="rounded-3xl p-8 flex flex-col items-center text-center"
                style={{ background: 'linear-gradient(135deg, rgba(88,86,214,0.08) 0%, rgba(10,132,255,0.06) 100%)', border: '1px solid rgba(10,132,255,0.15)' }}
              >
                <div className="w-16 h-16 rounded-3xl gradient-brand flex items-center justify-center mb-4 shadow-brand">
                  <Zap size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-ink text-xl mb-2">Bienvenido a FinanzApp</h3>
                <p className="text-sm text-muted max-w-xs mb-6 leading-relaxed">
                  Empieza registrando tu primer ingreso o gasto para tomar el control de tus finanzas personales.
                </p>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="px-8 py-3.5 rounded-2xl gradient-brand text-white text-sm font-bold shadow-brand hover:opacity-90 transition-opacity"
                >
                  Añadir movimiento
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </PageWrapper>
  );
}
