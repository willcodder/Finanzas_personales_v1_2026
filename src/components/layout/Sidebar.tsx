import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, CreditCard, BarChart2, Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TabName } from '../../types';

const tabs: { id: TabName; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'savings', label: 'Ahorros', icon: PiggyBank },
  { id: 'debts', label: 'Deudas', icon: CreditCard },
  { id: 'reports', label: 'Informes', icon: BarChart2 },
];

export function Sidebar() {
  const { activeTab, setActiveTab, isDark, toggleDark } = useStore();

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-white dark:bg-[#1C1C1E] border-r border-[#E5E5EA] dark:border-[#2C2C2E] z-30">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#007AFF] flex items-center justify-center text-xl">
            💰
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1C1C1E] dark:text-white leading-tight">Mi Finanzas</h1>
            <p className="text-xs text-[#8E8E93]">Control personal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-[#007AFF]/10 text-[#007AFF]'
                  : 'text-[#3A3A3C] dark:text-[#EBEBF5]/70 hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
              {active && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#007AFF]"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/70 hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] transition-colors"
        >
          {isDark ? <Sun size={20} strokeWidth={1.8} className="text-[#FFCC00]" /> : <Moon size={20} strokeWidth={1.8} />}
          <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
      </div>
    </div>
  );
}
