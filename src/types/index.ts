export type TransactionType = 'income' | 'expense';

export type CategoryColor =
  | 'blue' | 'green' | 'red' | 'orange' | 'yellow'
  | 'purple' | 'pink' | 'teal' | 'indigo';

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
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO string
  icon: string;
  color: CategoryColor;
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

export type TabName = 'dashboard' | 'transactions' | 'savings' | 'debts' | 'reports';
