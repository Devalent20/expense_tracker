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
    },
    // Mock data for previous month to test logic
    {
      id: '5',
      title: 'Pago Anterior',
      amount: 100,
      type: 'expense',
      date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      category: 'Otros'
    }
  ]);

  private initialBalance = signal<number>(1000);
  
  // State for selected month (defaults to 1st of current month)
  readonly selectedMonth = signal<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  readonly allTransactions = this.transactions.asReadonly();

  // Filter transactions for the selected month
  readonly monthlyTransactions = computed(() => {
    const selected = this.selectedMonth();
    return this.transactions().filter(t => 
      t.date.getMonth() === selected.getMonth() && 
      t.date.getFullYear() === selected.getFullYear()
    ).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort new to old
  });

  // Calculate opening balance (Initial + all transactions BEFORE this month)
  readonly openingBalance = computed(() => {
    const selected = this.selectedMonth();
    const previousTransactions = this.transactions().filter(t => 
      t.date < selected
    );

    const prevNet = previousTransactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );

    return this.initialBalance() + prevNet;
  });

  // Net result of the specific month
  readonly monthlyNet = computed(() => {
    return this.monthlyTransactions().reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );
  });

  // Closing balance = Opening + Monthly Net
  readonly closingBalance = computed(() => 
    this.openingBalance() + this.monthlyNet()
  );

  // Global Total (kept for reference or if we want to show it somewhere)
  readonly totalBalance = computed(() => 
    this.initialBalance() + this.transactions().reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)
  );

  readonly totalIncome = computed(() => 
    this.monthlyTransactions()
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  readonly totalExpense = computed(() => 
    this.monthlyTransactions()
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  addTransaction(transaction: Omit<Transaction, 'id' | 'date'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      // Use current date if in current month, otherwise 1st of selected month (simulation)
      date: new Date() 
    };
    this.transactions.update(items => [newTransaction, ...items]);
  }

  deleteTransaction(id: string) {
    this.transactions.update(items => items.filter(t => t.id !== id));
  }

  updateInitialBalance(targetClosingBalance: number) {
    const selected = this.selectedMonth();
    const nextMonth = new Date(selected.getFullYear(), selected.getMonth() + 1, 1);
    
    // Calculate net of all transactions up to the end of the selected month
    const netUntilMonthEnd = this.transactions()
      .filter(t => t.date < nextMonth)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

    // initial + net = target  =>  initial = target - net
    this.initialBalance.set(targetClosingBalance - netUntilMonthEnd);
  }

  // Navigation methods
  nextMonth() {
    this.selectedMonth.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  prevMonth() {
    this.selectedMonth.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
}
