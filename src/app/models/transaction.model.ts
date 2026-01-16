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
