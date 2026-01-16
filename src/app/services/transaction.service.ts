import { Injectable, computed, signal } from '@angular/core';
import { Transaction, TransactionType } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactions = signal<Transaction[]>([
    {
      id: '1',
      title: 'Salario Mensual',
      amount: 2500,
      type: 'income',
      date: new Date(),
      category: 'Nómina'
    },
    {
      id: '2',
      title: 'Compra Supermercado',
      amount: 150,
      type: 'expense',
      date: new Date(),
      category: 'Comidas'
    },
    {
      id: '3',
      title: 'Cena con amigos',
      amount: 60,
      type: 'expense',
      date: new Date(),
      category: 'Comidas'
    },
    {
      id: '4',
      title: 'Steam Sale',
      amount: 45,
      type: 'expense',
      date: new Date(),
      category: 'Juegos'
    }
  ]);

  readonly allTransactions = this.transactions.asReadonly();

  readonly totalBalance = computed(() => 
    this.transactions().reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)
  );

  readonly totalIncome = computed(() => 
    this.transactions()
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  readonly totalExpense = computed(() => 
    this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  addTransaction(transaction: Omit<Transaction, 'id' | 'date'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date()
    };
    this.transactions.update(items => [newTransaction, ...items]);
  }

  deleteTransaction(id: string) {
    this.transactions.update(items => items.filter(t => t.id !== id));
  }
}
