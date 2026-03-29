export type TransactionType = 'income' | 'expense';

export type CategoryColor =
  | 'blue' | 'green' | 'red' | 'orange' | 'yellow'
  | 'purple' | 'pink' | 'teal' | 'indigo';

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export type GoalCategory =
  | 'emergency' | 'travel' | 'home' | 'education'
  | 'vehicle' | 'tech' | 'health' | 'retirement' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color: CategoryColor;
  icon: string;
  createdAt: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: CategoryColor;
  type: TransactionType | 'both';
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // ISO string
  note?: string;
  accountId?: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO string
  icon: string;
  color: CategoryColor;
  goalCategory: GoalCategory;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  dueDate?: string;
  creditor: string;
  icon: string;
  color: CategoryColor;
  createdAt: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface DebtorPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debtor {
  id: string;
  name: string;
  amount: number;
  remainingAmount: number;
  description: string;
  date: string;
  dueDate?: string;
  icon: string;
  color: CategoryColor;
  createdAt: string;
  payments: DebtorPayment[];
}

export type TabName = 'dashboard' | 'transactions' | 'savings' | 'debts' | 'reports' | 'accounts' | 'debtors';
