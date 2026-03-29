import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, Transaction, SavingGoal, Debt, DebtPayment, Budget, TabName } from '../types';

interface AppState {
  // UI
  activeTab: TabName;
  isDark: boolean;

  // Data
  categories: Category[];
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  debts: Debt[];
  budgets: Budget[];

  // Actions
  setActiveTab: (tab: TabName) => void;
  toggleDark: () => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Savings
  addSavingGoal: (goal: Omit<SavingGoal, 'id' | 'createdAt'>) => void;
  updateSavingGoal: (id: string, goal: Partial<SavingGoal>) => void;
  deleteSavingGoal: (id: string) => void;
  addToSaving: (id: string, amount: number) => void;

  // Debts
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'payments'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addDebtPayment: (debtId: string, payment: Omit<DebtPayment, 'id'>) => void;

  // Budgets
  setBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salario', icon: '💼', color: 'green', type: 'income' },
  { id: 'cat-2', name: 'Freelance', icon: '💻', color: 'blue', type: 'income' },
  { id: 'cat-3', name: 'Inversiones', icon: '📈', color: 'indigo', type: 'income' },
  { id: 'cat-4', name: 'Otros ingresos', icon: '💰', color: 'teal', type: 'income' },
  { id: 'cat-5', name: 'Alimentación', icon: '🍔', color: 'orange', type: 'expense' },
  { id: 'cat-6', name: 'Transporte', icon: '🚗', color: 'blue', type: 'expense' },
  { id: 'cat-7', name: 'Vivienda', icon: '🏠', color: 'indigo', type: 'expense' },
  { id: 'cat-8', name: 'Salud', icon: '💊', color: 'red', type: 'expense' },
  { id: 'cat-9', name: 'Entretenimiento', icon: '🎬', color: 'purple', type: 'expense' },
  { id: 'cat-10', name: 'Ropa', icon: '👕', color: 'pink', type: 'expense' },
  { id: 'cat-11', name: 'Educación', icon: '📚', color: 'yellow', type: 'expense' },
  { id: 'cat-12', name: 'Restaurantes', icon: '🍽️', color: 'orange', type: 'expense' },
  { id: 'cat-13', name: 'Tecnología', icon: '📱', color: 'teal', type: 'expense' },
  { id: 'cat-14', name: 'Viajes', icon: '✈️', color: 'blue', type: 'expense' },
  { id: 'cat-15', name: 'Suscripciones', icon: '🔄', color: 'purple', type: 'expense' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      isDark: false,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      savingGoals: [],
      debts: [],
      budgets: [],

      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleDark: () => {
        const next = !get().isDark;
        set({ isDark: next });
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, { ...cat, id: uid() }] })),
      updateCategory: (id, cat) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...cat } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addTransaction: (tx) =>
        set((s) => ({ transactions: [{ ...tx, id: uid() }, ...s.transactions] })),
      updateTransaction: (id, tx) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...tx } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addSavingGoal: (goal) =>
        set((s) => ({
          savingGoals: [
            ...s.savingGoals,
            { ...goal, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateSavingGoal: (id, goal) =>
        set((s) => ({
          savingGoals: s.savingGoals.map((g) => (g.id === id ? { ...g, ...goal } : g)),
        })),
      deleteSavingGoal: (id) =>
        set((s) => ({ savingGoals: s.savingGoals.filter((g) => g.id !== id) })),
      addToSaving: (id, amount) =>
        set((s) => ({
          savingGoals: s.savingGoals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
              : g
          ),
        })),

      addDebt: (debt) =>
        set((s) => ({
          debts: [
            ...s.debts,
            { ...debt, id: uid(), createdAt: new Date().toISOString(), payments: [] },
          ],
        })),
      updateDebt: (id, debt) =>
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...debt } : d)),
        })),
      deleteDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),
      addDebtPayment: (debtId, payment) =>
        set((s) => ({
          debts: s.debts.map((d) => {
            if (d.id !== debtId) return d;
            const newPayment = { ...payment, id: uid() };
            const newRemaining = Math.max(0, d.remainingAmount - payment.amount);
            return {
              ...d,
              remainingAmount: newRemaining,
              payments: [...d.payments, newPayment],
            };
          }),
        })),

      setBudget: (budget) =>
        set((s) => {
          const existing = s.budgets.find(
            (b) => b.categoryId === budget.categoryId && b.month === budget.month
          );
          if (existing) {
            return {
              budgets: s.budgets.map((b) =>
                b.id === existing.id ? { ...b, amount: budget.amount } : b
              ),
            };
          }
          return { budgets: [...s.budgets, { ...budget, id: uid() }] };
        }),
      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),
    }),
    {
      name: 'finanzas-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
