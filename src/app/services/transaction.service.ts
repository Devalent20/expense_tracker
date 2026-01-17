import { Injectable, computed, signal } from '@angular/core';
import { Transaction, TransactionType, RecurringTemplate, BankAccount } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  readonly selectedAccount = signal<BankAccount>('sabadell');

  setSelectedAccount(account: BankAccount) {
    this.selectedAccount.set(account);
  }

  private transactions = signal<Transaction[]>([
    {
      id: '1',
      title: 'Salario Mensual',
      amount: 2500,
      type: 'income',
      date: new Date(),
      category: 'Nómina',
      accountId: 'sabadell'
    },
    {
      id: '2',
      title: 'Compra Supermercado',
      amount: 150,
      type: 'expense',
      date: new Date(),
      category: 'Comidas',
      accountId: 'sabadell'
    },
    {
      id: '3',
      title: 'Cena con amigos',
      amount: 60,
      type: 'expense',
      date: new Date(),
      category: 'Comidas',
      accountId: 'sabadell'
    },
    {
      id: '4',
      title: 'Steam Sale',
      amount: 45,
      type: 'expense',
      date: new Date(),
      category: 'Juegos',
      accountId: 'n26'
    },
    // Mock data for previous month to test logic
    {
      id: '5',
      title: 'Pago Anterior',
      amount: 100,
      type: 'expense',
      date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      category: 'Otros',
      accountId: 'sabadell'
    }
  ]);

  private initialBalances = signal<Record<BankAccount, number>>({
    sabadell: 1000,
    n26: 0
  });
  
  // State for selected month (defaults to 1st of current month)
  readonly selectedMonth = signal<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  readonly allTransactions = this.transactions.asReadonly();

  // Filter transactions for the selected month and account
  readonly monthlyTransactions = computed(() => {
    const selected = this.selectedMonth();
    const account = this.selectedAccount();
    return this.transactions().filter(t => 
      t.accountId === account &&
      t.date.getMonth() === selected.getMonth() && 
      t.date.getFullYear() === selected.getFullYear()
    ).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort new to old
  });

  // Calculate opening balance (Initial + all transactions BEFORE this month for selected account)
  readonly openingBalance = computed(() => {
    const selected = this.selectedMonth();
    const account = this.selectedAccount();
    
    const previousTransactions = this.transactions().filter(t => 
      t.accountId === account &&
      t.date < selected
    );

    const prevNet = previousTransactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );

    return this.initialBalances()[account] + prevNet;
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

  // Global Total for selected account
  readonly totalBalance = computed(() => {
    const account = this.selectedAccount();
    return this.initialBalances()[account] + this.transactions()
      .filter(t => t.accountId === account)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  });

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

  addTransaction(transaction: Omit<Transaction, 'id' | 'date' | 'accountId'> & { accountId?: BankAccount }) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      // Use current date if in current month, otherwise 1st of selected month (simulation)
      date: new Date(),
      accountId: transaction.accountId || this.selectedAccount()
    };
    this.transactions.update(items => [newTransaction, ...items]);
  }

  deleteTransaction(id: string) {
    this.transactions.update(items => items.filter(t => t.id !== id));
  }

  updateOpeningBalance(targetOpening: number) {
    const selected = this.selectedMonth();
    const account = this.selectedAccount();
    
    // Calculate net of all transactions BEFORE the selected month
    const netBeforeMonth = this.transactions()
      .filter(t => t.accountId === account && t.date < selected)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

    // initial + netBefore = targetOpening  =>  initial = targetOpening - netBefore
    this.initialBalances.update(balances => ({
      ...balances, 
      [account]: targetOpening - netBeforeMonth
    }));
  }

  private recurrings = signal<RecurringTemplate[]>([]);

  readonly recurringTemplates = computed(() => {
    const account = this.selectedAccount();
    return this.recurrings().filter(t => t.accountId === account);
  });

  deleteRecurringTemplate(id: string) {
    this.recurrings.update(list => list.filter(t => t.id !== id));
  }

  addRecurringTemplate(template: Omit<RecurringTemplate, 'id' | 'lastGenerated' | 'generatedMonths' | 'accountId'> & { accountId?: BankAccount }) {
    const newTemplate: RecurringTemplate = {
      ...template,
      id: crypto.randomUUID(),
      lastGenerated: new Date(),
      generatedMonths: [],
      accountId: template.accountId || this.selectedAccount()
    };
    this.recurrings.update(list => [...list, newTemplate]);
    this.checkAndGenerateRecurring(this.selectedMonth()); // Check immediately for current month
  }

  private checkAndGenerateRecurring(month: Date) {
    const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    let transactionsToAdd: Transaction[] = [];
    let templatesUpdated = false;

    const updatedTemplates = this.recurrings().map(template => {
      if (!template.generatedMonths.includes(monthKey)) {
        // Generate transaction
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          title: template.title,
          amount: template.amount,
          type: template.type,
          category: template.category,
          date: new Date(month.getFullYear(), month.getMonth(), 1), // 1st of the month
          accountId: template.accountId
        };
        transactionsToAdd.push(newTransaction);
        
        // Mark as generated
        templatesUpdated = true;
        return {
          ...template,
          generatedMonths: [...template.generatedMonths, monthKey],
          lastGenerated: new Date()
        };
      }
      return template;
    });

    if (templatesUpdated) {
      this.recurrings.set(updatedTemplates);
      if (transactionsToAdd.length > 0) {
        this.transactions.update(current => [...transactionsToAdd, ...current]);
      }
    }
  }

  // Navigation methods
  nextMonth() {
    this.selectedMonth.update(d => {
      const newDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      this.checkAndGenerateRecurring(newDate);
      return newDate;
    });
  }

  prevMonth() {
    this.selectedMonth.update(d => {
      const newDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      this.checkAndGenerateRecurring(newDate);
      return newDate;
    });
  }
}
