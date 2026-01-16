import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent {
  private transactionService = inject(TransactionService);
  
  transactions = this.transactionService.allTransactions;

  deleteTransaction(id: string) {
    this.transactionService.deleteTransaction(id);
  }
}
