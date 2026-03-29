import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useStore } from '../store/useStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { formatCompact } from '../utils/format';
import { colorMap } from '../utils/colors';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

type Period = '3m' | '6m' | '12m';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-apple-lg px-3 py-2 text-xs">
        <p className="font-semibold text-[#1C1C1E] dark:text-white mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {formatCompact(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function Reports() {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<Period>('6m');

  const periodMonths = period === '3m' ? 3 : period === '6m' ? 6 : 12;

  // Monthly bar data
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = periodMonths - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthTx = transactions.filter((tx) =>
        isWithinInterval(new Date(tx.date), { start, end })
      );
      const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      data.push({
        month: MONTH_ABBR[date.getMonth()],
        Ingresos: income,
        Gastos: expense,
        Neto: income - expense,
      });
    }
    return data;
  }, [transactions, period]);

  // Current month category breakdown
  const categoryData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const monthExpenses = transactions.filter((tx) =>
      tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start, end })
    );
    const total = monthExpenses.reduce((s, t) => s + t.amount, 0);
    const bycat: Record<string, number> = {};
    monthExpenses.forEach((tx) => {
      bycat[tx.categoryId] = (bycat[tx.categoryId] || 0) + tx.amount;
    });
    return Object.entries(bycat)
      .map(([id, amount]) => {
        const cat = categories.find((c) => c.id === id);
        return {
          name: cat?.name ?? 'Otro',
          value: amount,
          color: cat ? colorMap[cat.color].hex : '#8E8E93',
          icon: cat?.icon ?? '💸',
          pct: total > 0 ? (amount / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, categories]);

  // Net line chart
  const netData = useMemo(() => monthlyData.map((d) => ({ month: d.month, Neto: d.Neto })), [monthlyData]);

  // Summary stats
  const totalIncome = monthlyData.reduce((s, d) => s + d.Ingresos, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.Gastos, 0);
  const avgMonthlyExpense = periodMonths > 0 ? totalExpense / periodMonths : 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const noData = transactions.length === 0;

  return (
    <PageWrapper>
      <div className="px-5 md:px-8 pt-14 md:pt-10 pb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight mb-5">
          Informes
        </h1>

        {noData ? (
          <div className="flex flex-col items-center text-center py-16">
            <span className="text-5xl mb-4">📊</span>
            <h3 className="font-semibold text-[#1C1C1E] dark:text-white text-lg mb-2">Sin datos</h3>
            <p className="text-sm text-[#8E8E93]">Registra movimientos para ver tus informes.</p>
          </div>
        ) : (
          <>
            {/* Period selector */}
            <div className="flex gap-1 p-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl mb-5">
              {(['3m', '6m', '12m'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    period === p
                      ? 'bg-white dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white shadow-apple-sm'
                      : 'text-[#8E8E93]'
                  }`}
                >
                  {p === '3m' ? '3 meses' : p === '6m' ? '6 meses' : '1 año'}
                </button>
              ))}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total ingresos', value: totalIncome, color: '#34C759', icon: '↑' },
                { label: 'Total gastos', value: totalExpense, color: '#FF3B30', icon: '↓' },
                { label: 'Gasto mensual promedio', value: avgMonthlyExpense, color: '#FF9500', icon: '≈' },
                { label: 'Tasa de ahorro', value: null, display: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 0 ? '#007AFF' : '#FF3B30', icon: '💰' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base" style={{ color: stat.color }}>{stat.icon}</span>
                      <p className="text-xs text-[#8E8E93] leading-tight">{stat.label}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: stat.color }}>
                      {stat.display ?? formatCompact(stat.value!)}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts: 2 col on desktop */}
            <div className="md:grid md:grid-cols-2 md:gap-5 mb-5">

            {/* Bar Chart */}
            <Card className="p-4 mb-5 md:mb-0">
              <h2 className="text-sm font-semibold text-[#1C1C1E] dark:text-white mb-4">
                Ingresos vs Gastos
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barSize={8} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Ingresos" fill="#34C759" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#FF3B30" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Net line chart */}
            <Card className="p-4 mb-5 md:mb-0">
              <h2 className="text-sm font-semibold text-[#1C1C1E] dark:text-white mb-4">
                Resultado neto mensual
              </h2>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={netData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#8E8E93' }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Neto"
                    stroke="#007AFF"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#007AFF', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            </div>{/* end charts grid */}

            {/* Category Pie Chart */}
            {categoryData.length > 0 && (
              <Card className="p-4 mb-5">
                <h2 className="text-sm font-semibold text-[#1C1C1E] dark:text-white mb-4">
                  Gastos por categoría (mes actual)
                </h2>
                <div className="flex items-center gap-4">
                  <PieChart width={140} height={140}>
                    <Pie
                      data={categoryData}
                      cx={65}
                      cy={65}
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="flex-1 space-y-2">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-[#3A3A3C] dark:text-[#EBEBF5]/80 flex-1 truncate">
                          {cat.icon} {cat.name}
                        </span>
                        <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                          {cat.pct.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Category list detailed */}
            {categoryData.length > 0 && (
              <Card className="divide-y divide-[#F2F2F7] dark:divide-[#2C2C2E]">
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold text-[#1C1C1E] dark:text-white">
                    Detalle de gastos
                  </h2>
                </div>
                {categoryData.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    className="px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#1C1C1E] dark:text-white">
                        {cat.name}
                      </span>
                      <span className="text-sm font-semibold text-[#FF3B30]">
                        {formatCompact(cat.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-11">
                      <div className="flex-1 h-1 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="text-xs text-[#8E8E93]">{cat.pct.toFixed(1)}%</span>
                    </div>
                  </motion.div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
