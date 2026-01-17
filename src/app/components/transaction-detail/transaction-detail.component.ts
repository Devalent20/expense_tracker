import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction, TransactionType, ExpenseCategory, IncomeCategory, CategoryIcons, TransactionCategory } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-detail.component.html',
  styleUrl: './transaction-detail.component.css'
})
export class TransactionDetailComponent implements OnChanges {
  @Input() transaction: Transaction | null = null;
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  icons = CategoryIcons;
  expenseCategories: ExpenseCategory[] = ['Juegos', 'Comidas', 'Compras', 'Viajes', 'Suscripciones', 'Regalos', 'Otros'];
  incomeCategories: IncomeCategory[] = ['Ahorros', 'Nómina', 'Bizum'];

  detailForm = this.fb.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as TransactionType, Validators.required],
    category: ['Otros' as TransactionCategory, Validators.required],
    date: ['', Validators.required],
    comment: ['']
  });

  constructor() {
    this.detailForm.get('type')?.valueChanges.subscribe(type => {
      const currentCategory = this.detailForm.get('category')?.value;
      const isIncome = type === 'income';
      const categories: string[] = isIncome ? this.incomeCategories : this.expenseCategories;
      
      if (!categories.includes(currentCategory as string)) {
        this.detailForm.patchValue({ category: isIncome ? 'Ahorros' : 'Otros' });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transaction'] && this.transaction) {
      this.detailForm.patchValue({
        title: this.transaction.title,
        amount: this.transaction.amount,
        type: this.transaction.type,
        category: this.transaction.category,
        date: new Date(this.transaction.date).toISOString().split('T')[0],
        comment: this.transaction.comment || ''
      });
    }
  }

  get currentCategories(): TransactionCategory[] {
    const type = this.detailForm.get('type')?.value;
    return type === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  onSave() {
    if (this.detailForm.valid && this.transaction) {
      const val = this.detailForm.getRawValue();
      this.transactionService.updateTransaction(this.transaction.id, {
        title: val.title!,
        amount: Number(val.amount),
        type: val.type as TransactionType,
        category: val.category as any,
        date: new Date(val.date!),
        comment: val.comment || undefined
      });
      this.close.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }

  // Deletion confirmation state
  showConfirm = false;

  onDelete() {
    this.showConfirm = true;
  }

  cancelDelete() {
    this.showConfirm = false;
  }

  executeDelete() {
    if (this.transaction) {
      this.transactionService.deleteTransaction(this.transaction.id);
      this.showConfirm = false;
      this.close.emit();
    }
  }
}
