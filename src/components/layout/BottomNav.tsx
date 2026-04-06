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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-stretch px-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 px-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobileNavBg"
                  className="absolute inset-x-1 top-1.5 bottom-1 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(88,86,214,0.12) 0%, rgba(10,132,255,0.10) 100%)' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.7}
                className={`relative z-10 transition-colors ${active ? 'text-brand' : 'text-subtle'}`}
              />
              <span className={`text-[10px] font-semibold relative z-10 transition-colors ${active ? 'text-brand' : 'text-subtle'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
