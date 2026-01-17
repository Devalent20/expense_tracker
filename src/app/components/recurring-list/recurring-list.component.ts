import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryIcons } from '../../models/transaction.model';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recurring-list.component.html',
  styleUrl: './recurring-list.component.css'
})
export class RecurringListComponent {
  private transactionService = inject(TransactionService);

  recurringTemplates = this.transactionService.recurringTemplates;
  icons = CategoryIcons;

  confirmDeleteId: string | null = null;

  initiateDelete(id: string) {
    this.confirmDeleteId = id;
  }

  confirmDelete() {
    if (this.confirmDeleteId) {
      this.transactionService.deleteRecurringTemplate(this.confirmDeleteId);
      this.confirmDeleteId = null;
    }
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }
}
