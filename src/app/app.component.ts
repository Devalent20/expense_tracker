import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BalanceCardComponent } from './components/balance-card/balance-card.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { MonthSelectorComponent } from './components/month-selector/month-selector.component';
import { RecurringListComponent } from './components/recurring-list/recurring-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BalanceCardComponent, AddTransactionComponent, TransactionListComponent, MonthSelectorComponent, RecurringListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'expense-tracker';
  showRecurring = false;

  toggleRecurring() {
    this.showRecurring = !this.showRecurring;
  }
}
