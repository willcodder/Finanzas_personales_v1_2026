import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, CreditCard,
  BarChart2, Moon, Sun, Wallet
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TabName } from '../../types';

const nav: { id: TabName; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Movimientos',  icon: ArrowLeftRight },
  { id: 'savings',      label: 'Ahorros',      icon: PiggyBank },
  { id: 'debts',        label: 'Deudas',       icon: CreditCard },
  { id: 'reports',      label: 'Informes',     icon: BarChart2 },
];

export function Sidebar() {
  const { activeTab, setActiveTab, isDark, toggleDark } = useStore();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-sidebar z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <Wallet size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Mi Finanzas</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-2xs font-semibold text-white/25 uppercase tracking-widest px-2 mb-3">General</p>
        {nav.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-100 ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              <span className="font-medium">{label}</span>
              {active && (
                <motion.div
                  layoutId="sidebarDot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-white/5 pt-3">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-white/45 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          {isDark
            ? <Sun size={16} strokeWidth={1.8} className="text-yellow-400" />
            : <Moon size={16} strokeWidth={1.8} />}
          <span className="font-medium">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
      </div>
    </aside>
  );
}
