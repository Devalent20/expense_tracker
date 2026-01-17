import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { BankAccount } from '../../models/transaction.model';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-card.component.html',
  styleUrl: './balance-card.component.css'
})
export class BalanceCardComponent {
  private transactionService = inject(TransactionService);

  selectedAccount = this.transactionService.selectedAccount;
  openingBalance = this.transactionService.openingBalance;
  closingBalance = this.transactionService.closingBalance;
  monthlyNet = this.transactionService.monthlyNet;

  setAccount(account: BankAccount) {
    this.transactionService.setSelectedAccount(account);
  }

  isEditing = false;

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveBalance(amount: string) {
    const value = parseFloat(amount);
    if (!isNaN(value)) {
      this.transactionService.updateOpeningBalance(value);
    }
    this.isEditing = false;
  }
}
