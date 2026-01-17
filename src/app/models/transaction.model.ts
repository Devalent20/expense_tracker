export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 'Juegos' | 'Comidas' | 'Compras' | 'Viajes' | 'Suscripciones' | 'Regalos' | 'Ahorros' | 'Vivienda' | 'Otros';
export type IncomeCategory = 'Ahorros' | 'Nómina' | 'Bizum';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type BankAccount = 'sabadell' | 'n26';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  category: TransactionCategory;
  accountId: BankAccount;
  comment?: string;
}

export interface RecurringTemplate {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  accountId: BankAccount;
  lastGenerated: Date;
  generatedMonths: string[]; // keys like "2026-01"
  comment?: string;
}

export const CategoryIcons: Record<TransactionCategory, string> = {
  'Juegos': '🎮',
  'Comidas': '🍔',
  'Compras': '🛍️',
  'Viajes': '✈️',
  'Suscripciones': '📅',
  'Regalos': '🎁',
  'Vivienda': '🏠',
  'Otros': '📦',
  'Ahorros': '💰',
  'Nómina': '💼',
  'Bizum': '📱'
};
