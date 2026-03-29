import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { formatCompact } from '../utils/format';
import { colorMap } from '../utils/colors';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
type Period = '3m' | '6m' | '12m';

function Tooltip_({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-dropdown px-3 py-2 text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {payload.map((e: any) => (
        <p key={e.name} style={{ color: e.color ?? e.fill }}>
          {e.name}: {formatCompact(e.value)}
        </p>
      ))}
    </div>
  );
}

export function Reports() {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<Period>('6m');
  const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;

  const monthlyData = useMemo(() => {
    return Array.from({ length: months }, (_, i) => {
      const d = subMonths(new Date(), months - 1 - i);
      const start = startOfMonth(d);
      const end   = endOfMonth(d);
      const txs   = transactions.filter(tx => isWithinInterval(new Date(tx.date), { start, end }));
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: MONTHS[d.getMonth()], Ingresos: income, Gastos: expense, Neto: income - expense };
    });
  }, [transactions, period]);

  const { categoryData, categoryTrend } = useMemo(() => {
    const now       = new Date();
    const curStart  = startOfMonth(now);
    const curEnd    = endOfMonth(now);
    const prevStart = startOfMonth(subMonths(now, 1));
    const prevEnd   = endOfMonth(subMonths(now, 1));

    const curExps  = transactions.filter(tx => tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start: curStart, end: curEnd }));
    const prevExps = transactions.filter(tx => tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start: prevStart, end: prevEnd }));

    const total = curExps.reduce((s, t) => s + t.amount, 0);

    const byCatCur:  Record<string, number> = {};
    const byCatPrev: Record<string, number> = {};
    curExps.forEach(tx  => { byCatCur[tx.categoryId]  = (byCatCur[tx.categoryId]  || 0) + tx.amount; });
    prevExps.forEach(tx => { byCatPrev[tx.categoryId] = (byCatPrev[tx.categoryId] || 0) + tx.amount; });

    const all = Array.from(new Set([...Object.keys(byCatCur), ...Object.keys(byCatPrev)]));
    const withTrend = all
      .map(id => {
        const cat   = categories.find(c => c.id === id);
        const cur   = byCatCur[id]  || 0;
        const prev  = byCatPrev[id] || 0;
        const delta = prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0;
        return {
          name: cat?.name ?? 'Otro',
          value: cur,
          prevValue: prev,
          color: cat ? colorMap[cat.color].hex : '#9CA3AF',
          icon: cat?.icon ?? '💸',
          pct: total > 0 ? (cur / total) * 100 : 0,
          delta,
        };
      })
      .sort((a, b) => b.value - a.value);

    return {
      categoryData: withTrend.filter(d => d.value > 0).slice(0, 8),
      categoryTrend: withTrend,
    };
  }, [transactions, categories]);

  const totalIncome  = monthlyData.reduce((s, d) => s + d.Ingresos, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.Gastos, 0);
  const avgExpense   = months > 0 ? totalExpense / months : 0;
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const noData = transactions.length === 0;

  const topSpend   = categoryTrend.filter(d => d.value > 0).slice(0, 5);
  const biggestInc = [...categoryTrend].filter(d => d.delta > 5 && d.value > 0).sort((a, b) => b.delta - a.delta).slice(0, 3);
  const biggestDec = [...categoryTrend].filter(d => d.delta < -5 && d.prevValue > 0).sort((a, b) => a.delta - b.delta).slice(0, 3);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 pt-6 pb-5 gap-4">
        <h1 className="text-xl font-semibold text-ink">Informes</h1>
        <div className="flex gap-1 p-0.5 bg-surface border border-border rounded-lg w-fit">
          {(['3m','6m','12m'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p ? 'bg-card text-ink shadow-sm border border-border' : 'text-muted hover:text-ink'
              }`}
            >
              {p === '3m' ? '3 meses' : p === '6m' ? '6 meses' : '1 año'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-8 pb-6 space-y-5">
        {noData ? (
          <Card padding className="flex flex-col items-center text-center py-16">
            <span className="text-4xl mb-3">📊</span>
            <p className="font-semibold text-ink mb-1">Sin datos</p>
            <p className="text-sm text-muted">Registra movimientos para ver tus informes.</p>
          </Card>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total ingresos', value: formatCompact(totalIncome), color: 'text-up', bg: 'bg-up-light' },
                { label: 'Total gastos', value: formatCompact(totalExpense), color: 'text-down', bg: 'bg-down-light' },
                { label: 'Gasto mensual promedio', value: formatCompact(avgExpense), color: 'text-warn', bg: 'bg-warn-light' },
                { label: 'Tasa de ahorro', value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 0 ? 'text-brand' : 'text-down', bg: savingsRate >= 0 ? 'bg-brand-light' : 'bg-down-light' },
              ].map((k, i) => (
                <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card padding>
                    <p className="text-xs text-muted mb-2">{k.label}</p>
                    <p className={`text-xl font-semibold tabular-nums tracking-tight ${k.color}`}>{k.value}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main charts */}
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="md:col-span-2 p-5">
                <h2 className="text-sm font-semibold text-ink mb-5">Ingresos vs Gastos por mes</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} barSize={10} barGap={4} margin={{ left: -16, right: 4, top: 4 }}>
                    <CartesianGrid stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<Tooltip_ />} />
                    <Bar dataKey="Ingresos" fill="#16A34A" radius={[3,3,0,0]} />
                    <Bar dataKey="Gastos" fill="#DC2626" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-up"/><span className="text-xs text-muted">Ingresos</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-down"/><span className="text-xs text-muted">Gastos</span></div>
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-ink mb-4">Gastos por categoría</h2>
                {categoryData.length === 0 ? (
                  <p className="text-xs text-subtle text-center py-8">Sin datos este mes</p>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <PieChart width={140} height={140}>
                        <Pie data={categoryData} cx={65} cy={65} innerRadius={38} outerRadius={65} paddingAngle={2} dataKey="value">
                          {categoryData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<Tooltip_ />} />
                      </PieChart>
                    </div>
                    <div className="space-y-2">
                      {categoryData.slice(0, 5).map(cat => (
                        <div key={cat.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs text-ink flex-1 truncate">{cat.icon} {cat.name}</span>
                          <span className="text-xs font-semibold text-muted tabular-nums">{cat.pct.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            {/* Net area chart */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink mb-5">Resultado neto mensual</h2>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={monthlyData} margin={{ left: -16, right: 4, top: 4 }}>
                  <defs>
                    <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<Tooltip_ />} />
                  <Area type="monotone" dataKey="Neto" stroke="#4F46E5" strokeWidth={2} fill="url(#gn)" dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Category ranking */}
            {topSpend.length > 0 && (
              <div className="grid md:grid-cols-3 gap-5">
                <Card className="md:col-span-2">
                  <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-ink">Ranking de gastos — mes actual</h2>
                    <span className="text-xs text-muted">vs mes anterior</span>
                  </div>
                  <div className="hidden md:grid grid-cols-[1fr_110px_90px_70px] gap-4 px-5 py-2 bg-surface border-b border-border text-2xs font-semibold text-subtle uppercase tracking-wider">
                    <span>Categoría</span>
                    <span className="text-right">Importe</span>
                    <span className="text-right">% del total</span>
                    <span className="text-right">Tendencia</span>
                  </div>
                  {topSpend.map((cat, i) => {
                    const isUp   = cat.delta > 5;
                    const isDown = cat.delta < -5;
                    return (
                      <div key={cat.name} className={`flex md:grid md:grid-cols-[1fr_110px_90px_70px] gap-2 md:gap-4 items-center px-5 py-3 hover:bg-surface transition-colors ${i < topSpend.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded text-xs flex items-center justify-center font-semibold text-muted bg-surface border border-border flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                            {cat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{cat.name}</p>
                            <div className="h-1 rounded-full bg-border overflow-hidden w-full md:w-32 mt-1">
                              <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-down tabular-nums md:text-right">{formatCompact(cat.value)}</p>
                        <p className="text-sm text-muted tabular-nums md:text-right">{cat.pct.toFixed(1)}%</p>
                        <div className="flex items-center gap-1 md:justify-end">
                          {isUp   && <TrendingUp  size={13} className="text-down flex-shrink-0" />}
                          {isDown && <TrendingDown size={13} className="text-up flex-shrink-0" />}
                          {!isUp && !isDown && <Minus size={13} className="text-muted flex-shrink-0" />}
                          <span className={`text-xs font-medium tabular-nums ${isUp ? 'text-down' : isDown ? 'text-up' : 'text-muted'}`}>
                            {cat.delta > 0 ? '+' : ''}{cat.delta.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </Card>

                <div className="space-y-3">
                  {biggestInc.length > 0 && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={14} className="text-down" />
                        <h3 className="text-xs font-semibold text-ink">Mayor subida</h3>
                      </div>
                      <div className="space-y-2.5">
                        {biggestInc.map(cat => (
                          <div key={cat.name} className="flex items-center gap-2">
                            <span className="text-sm">{cat.icon}</span>
                            <p className="text-xs text-ink flex-1 truncate">{cat.name}</p>
                            <span className="text-xs font-semibold text-down tabular-nums">+{cat.delta.toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {biggestDec.length > 0 && (
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown size={14} className="text-up" />
                        <h3 className="text-xs font-semibold text-ink">Mayor bajada</h3>
                      </div>
                      <div className="space-y-2.5">
                        {biggestDec.map(cat => (
                          <div key={cat.name} className="flex items-center gap-2">
                            <span className="text-sm">{cat.icon}</span>
                            <p className="text-xs text-ink flex-1 truncate">{cat.name}</p>
                            <span className="text-xs font-semibold text-up tabular-nums">{cat.delta.toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {biggestInc.length === 0 && biggestDec.length === 0 && (
                    <Card className="p-4 flex flex-col items-center text-center py-8">
                      <Minus size={20} className="text-muted mb-2" />
                      <p className="text-xs text-muted">Sin variaciones significativas respecto al mes anterior</p>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
