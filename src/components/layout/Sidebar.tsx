import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, CreditCard,
  BarChart2, Moon, Sun, Landmark, UserX, Zap
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TabName } from '../../types';

const nav: { id: TabName; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'dashboard',    label: 'Inicio',       icon: LayoutDashboard },
  { id: 'accounts',     label: 'Cuentas',      icon: Landmark },
  { id: 'transactions', label: 'Movimientos',  icon: ArrowLeftRight },
  { id: 'savings',      label: 'Ahorros',      icon: PiggyBank },
  { id: 'debts',        label: 'Deudas',       icon: CreditCard },
  { id: 'debtors',      label: 'Morosos',      icon: UserX },
  { id: 'reports',      label: 'Informes',     icon: BarChart2 },
];

export function Sidebar() {
  const { activeTab, setActiveTab, isDark, toggleDark } = useStore();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-sidebar z-40">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-brand-sm">
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">FinanzApp</span>
            <p className="text-white/30 text-2xs font-medium">Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-hide">
        <p className="text-2xs font-semibold text-white/20 uppercase tracking-widest px-3 mb-2">Menu</p>
        {nav.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                active
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/75 hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarBg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(88,86,214,0.5) 0%, rgba(10,132,255,0.3) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
              <Icon
                size={16}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className="relative z-10 flex-1 text-left">{label}</span>
              {active && (
                <motion.div
                  layoutId="sidebarDot"
                  className="relative z-10 w-1.5 h-1.5 rounded-full bg-brand"
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mx-4 h-px bg-white/5 mb-3" />
      <div className="px-3 pb-6">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/75 hover:bg-white/5 transition-all duration-150"
        >
          {isDark
            ? <Sun size={16} strokeWidth={1.8} className="text-yellow-400/80" />
            : <Moon size={16} strokeWidth={1.8} />}
          <span className="font-medium">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
      </div>
    </aside>
  );
}
