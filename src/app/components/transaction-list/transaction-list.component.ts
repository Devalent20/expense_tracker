import { Component, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ExpenseCategory, IncomeCategory, CategoryIcons, TransactionCategory } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent {
  private transactionService = inject(TransactionService);
  
  @Output() viewDetails = new EventEmitter<void>();

  monthlyTransactions = this.transactionService.monthlyTransactions;
  categoryFilter = signal<string>('');
  
  icons = CategoryIcons;

  allCategories: TransactionCategory[] = ['Juegos', 'Comidas', 'Compras', 'Viajes', 'Suscripciones', 'Regalos', 'Otros', 'Ahorros', 'Nómina', 'Bizum'].sort() as TransactionCategory[];

  filteredTransactions = computed(() => {
    const filter = this.categoryFilter();
    const list = this.monthlyTransactions();
    
    if (!filter) return list;
    
    return list.filter(t => t.category === filter);
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
