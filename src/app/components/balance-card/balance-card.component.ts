import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-card.component.html',
  styleUrl: './balance-card.component.css'
})
export class BalanceCardComponent {
  private transactionService = inject(TransactionService);

  totalBalance = this.transactionService.totalBalance;
  totalIncome = this.transactionService.totalIncome;
  totalExpense = this.transactionService.totalExpense;

  isEditing = false;

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveBalance(amount: string) {
    const value = parseFloat(amount);
    if (!isNaN(value)) {
      this.transactionService.updateInitialBalance(value);
    }
    this.isEditing = false;
  }
}
