export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 'Juegos' | 'Comidas' | 'Compras' | 'Viajes' | 'Suscripciones' | 'Regalos' | 'Otros';
export type IncomeCategory = 'Ahorros' | 'Nómina' | 'Bizum';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  category: TransactionCategory;
}

export interface RecurringTemplate {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  lastGenerated: Date;
  generatedMonths: string[]; // keys like "2026-01"
}

export const CategoryIcons: Record<TransactionCategory, string> = {
  'Juegos': '🎮',
  'Comidas': '🍔',
  'Compras': '🛍️',
  'Viajes': '✈️',
  'Suscripciones': '📅',
  'Regalos': '🎁',
  'Otros': '📦',
  'Ahorros': '💰',
  'Nómina': '💼',
  'Bizum': '📱'
};
