import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ExportService } from '../../services/export.service';
import { CategoryIcons, Transaction, TransactionCategory } from '../../models/transaction.model';

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
  allCategories: TransactionCategory[] = ['Juegos', 'Comidas', 'Compras', 'Viajes', 'Suscripciones', 'Regalos', 'Otros', 'Ahorros', 'Nómina', 'Bizum'].sort() as TransactionCategory[];
  categoryFilter = signal<string>('');

  filteredTransactions = computed(() => {
    const filter = this.categoryFilter();
    const list = this.monthlyTransactions();
    if (!filter) return list;
    return list.filter(t => t.category === filter);
  });

  filteredTotal = computed(() => {
    const list = this.filteredTransactions();
    return list.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  });

  categorySummaries = computed(() => {
    const list = this.monthlyTransactions();
    const map = new Map<TransactionCategory, number>();

    list.forEach(t => {
      const current = map.get(t.category) || 0;
      const amount = t.type === 'income' ? t.amount : -t.amount;
      map.set(t.category, current + amount);
    });

    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .filter(item => item.total !== 0)
      .sort((a, b) => a.total - b.total); // Most negative (expenses) first
  });

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
