import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-selector.component.html',
  styleUrl: './month-selector.component.css'
})
export class MonthSelectorComponent {
  private transactionService = inject(TransactionService);

  selectedMonth = this.transactionService.selectedMonth;

  prevMonth() {
    this.transactionService.prevMonth();
  }

  nextMonth() {
    this.transactionService.nextMonth();
  }
}
