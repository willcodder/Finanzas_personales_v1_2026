import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, UserX, CreditCard, PiggyBank } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { TabName } from '../../types';

const tabs: { id: TabName; label: string; icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }> }[] = [
  { id: 'dashboard',    label: 'Inicio',      icon: LayoutDashboard },
  { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'savings',      label: 'Ahorros',     icon: PiggyBank },
  { id: 'debts',        label: 'Deudas',      icon: CreditCard },
  { id: 'debtors',      label: 'Morosos',     icon: UserX },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border">
      <div className="flex items-stretch">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 relative"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.7}
                className={active ? 'text-brand' : 'text-subtle'}
              />
              <span className={`text-[10px] font-medium truncate ${active ? 'text-brand' : 'text-subtle'}`}>
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobileNavBar"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-brand"
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
