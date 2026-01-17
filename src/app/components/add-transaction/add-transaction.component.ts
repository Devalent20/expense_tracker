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

    // Auto-set category to 'Suscripciones' if recurring is checked
    this.transactionForm.get('isRecurring')?.valueChanges.subscribe(isRecurring => {
      if (isRecurring) {
        this.transactionForm.get('category')?.setValue('Suscripciones');
        this.transactionForm.get('category')?.disable();
      } else {
        this.transactionForm.get('category')?.enable();
        const type = this.transactionForm.get('type')?.value;
        this.transactionForm.get('category')?.setValue(type === 'income' ? 'Ahorros' : 'Otros');
      }
    });
  }

  icons = CategoryIcons;

  expenseCategories: ExpenseCategory[] = ['Juegos', 'Comidas', 'Compras', 'Viajes', 'Regalos', 'Otros'];
  incomeCategories: IncomeCategory[] = ['Ahorros', 'Nómina', 'Bizum'];

  // Getter to switch categories based on type
  get currentCategories(): TransactionCategory[] {
    const isRecurring = this.transactionForm.get('isRecurring')?.value;
    const type = this.transactionForm.get('type')?.value;
    
    if (isRecurring) {
      return ['Suscripciones'] as TransactionCategory[];
    }

    return type === 'income' 
      ? this.incomeCategories 
      : this.expenseCategories;
  }

  increment() {
    const current = this.transactionForm.get('amount')?.value || 0;
    this.transactionForm.patchValue({ amount: current + 1 });
  }

  decrement() {
    const current = this.transactionForm.get('amount')?.value || 0;
    if (current > 0) {
      this.transactionForm.patchValue({ amount: Math.max(0, current - 1) });
    }
  }

  onSubmit() {
    if (this.transactionForm.valid || (this.transactionForm.get('isRecurring')?.value && this.transactionForm.get('title')?.valid && this.transactionForm.get('amount')?.valid)) {
      const formValue = this.transactionForm.getRawValue(); // GetRawValue because category might be disabled
      
      const transactionData = {
        title: formValue.title!,
        amount: Number(formValue.amount),
        type: formValue.type as TransactionType,
        category: formValue.isRecurring ? 'Suscripciones' : formValue.category as any
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
      // Ensure category is enabled after reset
      this.transactionForm.get('category')?.enable();
    }
  }
}
