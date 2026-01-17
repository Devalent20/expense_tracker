import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ExpenseCategory, IncomeCategory, TransactionCategory, TransactionType, CategoryIcons } from '../../models/transaction.model';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.css'
})
export class AddTransactionComponent {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  transactionForm = this.fb.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as TransactionType, Validators.required],
    category: ['Otros', Validators.required],
    isRecurring: [false]
  });

  constructor() {
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      const defaultCategory = type === 'income' ? 'Ahorros' : 'Otros';
      this.transactionForm.patchValue({ category: defaultCategory });
    });
  }

  icons = CategoryIcons;

  expenseCategories: ExpenseCategory[] = ['Juegos', 'Comidas', 'Compras', 'Viajes', 'Suscripciones', 'Regalos', 'Otros'];
  incomeCategories: IncomeCategory[] = ['Ahorros', 'Nómina', 'Bizum'];

  // Getter to switch categories based on type
  get currentCategories(): TransactionCategory[] {
    return this.transactionForm.get('type')?.value === 'income' 
      ? this.incomeCategories 
      : this.expenseCategories;
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      const transactionData = {
        title: formValue.title!,
        amount: Number(formValue.amount),
        type: formValue.type as TransactionType,
        category: formValue.category as any
      };

      this.transactionService.addTransaction(transactionData);
      
      if (formValue.isRecurring) {
        this.transactionService.addRecurringTemplate(transactionData);
      }
      
      // Reset form but keep type for convenience
      this.transactionForm.reset({
        title: '',
        amount: 0,
        type: formValue.type as TransactionType,
        category: formValue.type === 'income' ? 'Ahorros' : 'Otros',
        isRecurring: false
      });
    }
  }
}
