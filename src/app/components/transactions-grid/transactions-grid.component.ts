import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryIcons, Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-grid.component.html',
  styleUrl: './transactions-grid.component.css'
})
export class TransactionsGridComponent {
  private transactionService = inject(TransactionService);
  
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<Transaction>();

  monthlyTransactions = this.transactionService.monthlyTransactions;
  selectedMonth = this.transactionService.selectedMonth;
  selectedAccount = this.transactionService.selectedAccount;
  
  icons = CategoryIcons;

  onSelect(transaction: Transaction) {
    this.select.emit(transaction);
  }

  onClose() {
    this.close.emit();
  }

  deleteTransaction(id: string) {
    if (confirm('¿Eliminar esta transacción?')) {
      this.transactionService.deleteTransaction(id);
    }
  }
}
