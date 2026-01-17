import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BalanceCardComponent } from './components/balance-card/balance-card.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { MonthSelectorComponent } from './components/month-selector/month-selector.component';
import { RecurringListComponent } from './components/recurring-list/recurring-list.component';
import { TransactionsGridComponent } from './components/transactions-grid/transactions-grid.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';
import { Transaction } from './models/transaction.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BalanceCardComponent, AddTransactionComponent, TransactionListComponent, MonthSelectorComponent, RecurringListComponent, TransactionsGridComponent, TransactionDetailComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'expense-tracker';
  showRecurring = false;
  viewMode: 'dashboard' | 'grid' = 'dashboard';
  selectedTransaction: Transaction | null = null;

  toggleRecurring() {
    this.showRecurring = !this.showRecurring;
  }

  setViewMode(mode: 'dashboard' | 'grid') {
    this.viewMode = mode;
  }

  selectTransaction(transaction: Transaction | null) {
    this.selectedTransaction = transaction;
  }
}
