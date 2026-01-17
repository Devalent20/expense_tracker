import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ExportService } from '../../services/export.service';
import { ExpenseCategory, IncomeCategory, CategoryIcons, TransactionCategory, Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent {
  private transactionService = inject(TransactionService);
  private exportService = inject(ExportService);
  
  @Output() viewDetails = new EventEmitter<void>();
  @Output() select = new EventEmitter<Transaction>();

  async onExport() {
    const monthStr = this.selectedMonth().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    await this.exportService.exportTransactionsToExcel(this.filteredTransactions(), 'Resumen_Movimientos.xlsx', monthStr);
  }

  monthlyTransactions = this.transactionService.monthlyTransactions;
  selectedMonth = this.transactionService.selectedMonth;
  categoryFilter = signal<string>('');
  
  icons = CategoryIcons;

  allCategories: TransactionCategory[] = ['Juegos', 'Comidas', 'Compras', 'Viajes', 'Suscripciones', 'Regalos', 'Otros', 'Ahorros', 'Nómina', 'Bizum'].sort() as TransactionCategory[];

  // No local editing state needed anymore
  
  onSelect(transaction: Transaction) {
    this.select.emit(transaction);
  }

  // Deletion confirmation state
  transactionToDelete = signal<string | null>(null);

  confirmDelete(id: string, event: Event) {
    event.stopPropagation(); // Don't open detail
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

  filteredTransactions = computed(() => {
    const filter = this.categoryFilter();
    const list = this.monthlyTransactions();
    
    if (!filter) return list;
    
    return list.filter(t => t.category === filter);
  });

  filteredTotal = computed(() => {
    const transactions = this.filteredTransactions();
    return transactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );
  });

  deleteTransaction(id: string) {
    this.transactionService.deleteTransaction(id);
  }

  clearAllData() {
    if (confirm('¿ESTÁS SEGURO? Se borrarán TODAS las transacciones, cuentas y suscripciones permanentemente.')) {
      this.transactionService.clearAllData();
    }
  }

  onViewDetails() {
    this.viewDetails.emit();
  }
}
