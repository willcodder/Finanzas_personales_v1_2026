import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, CreditCard, BarChart2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TabName } from '../../types';

const tabs: { id: TabName; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'savings', label: 'Ahorros', icon: PiggyBank },
  { id: 'debts', label: 'Deudas', icon: CreditCard },
  { id: 'reports', label: 'Informes', icon: BarChart2 },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-30">
      <div className="glass dark:bg-[#1C1C1E]/80 border-t border-[#E5E5EA]/60 dark:border-[#3A3A3C]/60 px-2 pb-safe">
        <div className="flex items-center justify-around">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-0.5 py-2 px-3 relative min-w-0"
              >
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? 'text-[#007AFF]' : 'text-[#8E8E93]'}
                  />
                  {active && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#007AFF]"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium truncate ${
                    active ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
