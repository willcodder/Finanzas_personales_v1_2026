import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';
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
import { Auth } from './pages/Auth';
import './index.css';

function App() {
  const { activeTab, isDark, loadCloudData, resetToDefaults } = useStore();
  const { user, authLoading, setSession, setAuthLoading } = useAuthStore();
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedUserId = useRef<string | null>(null);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Load user data from Supabase
  const loadUserData = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (!error && data?.data && Object.keys(data.data).length > 0) {
      loadCloudData(data.data);
    }
  };

  // Save user data to Supabase (debounced)
  const scheduleSave = (userId: string) => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const state = useStore.getState();
      const payload = {
        accounts: state.accounts,
        categories: state.categories,
        transactions: state.transactions,
        savingGoals: state.savingGoals,
        debts: state.debts,
        budgets: state.budgets,
        debtors: state.debtors,
      };
      await supabase
        .from('user_data')
        .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() });
    }, 1500);
  };

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        loadUserData(session.user.id);
        lastSyncedUserId.current = session.user.id;
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user && lastSyncedUserId.current !== session.user.id) {
        lastSyncedUserId.current = session.user.id;
        loadUserData(session.user.id);
      }
      if (!session) {
        lastSyncedUserId.current = null;
        resetToDefaults();
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to store changes → sync to cloud
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const unsub = useStore.subscribe(() => {
      scheduleSave(userId);
    });
    return () => {
      unsub();
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Loading screen
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #111118 50%, #0A0A0A 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-brand"
            style={{ background: 'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)' }}
          >
            <Zap size={30} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return <Auth />;
  }

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
