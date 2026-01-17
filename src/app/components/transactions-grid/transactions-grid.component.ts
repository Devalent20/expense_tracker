import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ExportService } from '../../services/export.service';
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
  private exportService = inject(ExportService);
  
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<Transaction>();

  async onExport() {
    const monthStr = this.selectedMonth().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const fileName = `Transacciones_${this.selectedAccount()}_${monthStr}.xlsx`;
    await this.exportService.exportTransactionsToExcel(this.monthlyTransactions(), fileName, monthStr);
  }

  monthlyTransactions = this.transactionService.monthlyTransactions;
  selectedMonth = this.transactionService.selectedMonth;
  selectedAccount = this.transactionService.selectedAccount;
  
  icons = CategoryIcons;

  onSelect(transaction: Transaction) {
    this.select.emit(transaction);
  }

  // Deletion confirmation state
  transactionToDelete = signal<string | null>(null);

  confirmDelete(id: string, event: Event) {
    event.stopPropagation();
    this.transactionToDelete.set(id);
  }

  cancelDelete() {
    this.transactionToDelete.set(null);
  }

  executeDelete() {
    const id = this.transactionToDelete();
    if (id) {
      this.transactionService.deleteTransaction(id);
      this.transactionToDelete.set(null);
    }
  }

  onClose() {
    this.close.emit();
  }

  deleteTransaction(id: string) {
    // This is now handled by confirmDelete -> executeDelete
  }
}
