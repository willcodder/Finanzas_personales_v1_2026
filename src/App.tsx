import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Savings } from './pages/Savings';
import { Debts } from './pages/Debts';
import { Reports } from './pages/Reports';
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
        {activeTab === 'transactions' && <Transactions key="transactions" />}
        {activeTab === 'savings'      && <Savings      key="savings" />}
        {activeTab === 'debts'        && <Debts        key="debts" />}
        {activeTab === 'reports'      && <Reports      key="reports" />}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

export default App;
