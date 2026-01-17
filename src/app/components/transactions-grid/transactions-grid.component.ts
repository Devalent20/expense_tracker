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

  monthlyTransactions = this.transactionService.monthlyTransactions;
  selectedMonth = this.transactionService.selectedMonth;
  selectedAccount = this.transactionService.selectedAccount;
  
  icons = CategoryIcons;

  // Editing state
  editingId = signal<string | null>(null);
  editValue = signal<string>('');

  startEdit(transaction: Transaction) {
    this.editingId.set(transaction.id);
    this.editValue.set(transaction.comment || '');
  }

  saveEdit(transaction: Transaction) {
    this.transactionService.updateTransaction(transaction.id, { comment: this.editValue() });
    this.editingId.set(null);
  }

  cancelEdit() {
    this.editingId.set(null);
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
