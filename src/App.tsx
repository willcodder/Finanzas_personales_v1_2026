import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Savings } from './pages/Savings';
import { Debts } from './pages/Debts';
import { Accounts } from './pages/Accounts';
import { Reports } from './pages/Reports';
import { Debtors } from './pages/Debtors';
import { QuickAdd } from './components/ui/QuickAdd';
import './index.css';

function App() {
  const { activeTab, isDark } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="bg-surface min-h-screen">
      <Sidebar />
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard'    && <Dashboard    key="dashboard" />}
        {activeTab === 'accounts'     && <Accounts     key="accounts" />}
        {activeTab === 'transactions' && <Transactions key="transactions" />}
        {activeTab === 'savings'      && <Savings      key="savings" />}
        {activeTab === 'debts'        && <Debts        key="debts" />}
        {activeTab === 'debtors'      && <Debtors      key="debtors" />}
        {activeTab === 'reports'      && <Reports      key="reports" />}
      </AnimatePresence>
      <QuickAdd />
      <BottomNav />
    </div>
  );
}

export default App;
