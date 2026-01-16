import { TestBed } from '@angular/core/testing';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate initial balance correctly from mock data', () => {
    // Mock data: 2500 (income) - 150 - 60 - 45 (expenses) = 2245
    expect(service.totalBalance()).toBe(2245);
    expect(service.totalIncome()).toBe(2500);
    expect(service.totalExpense()).toBe(255);
  });

  it('should add a transaction and update balance', () => {
    const initialBalance = service.totalBalance();
    
    service.addTransaction({
      title: 'Test Bizum',
      amount: 50,
      type: 'income',
      category: 'Bizum'
    });

    expect(service.totalBalance()).toBe(initialBalance + 50);
    expect(service.allTransactions().length).toBe(5);
  });

  it('should delete a transaction and update balance', () => {
    // Delete the 'Steam Sale' (45)
    // Find ID of Steam Sale (mock id is '4')
    service.deleteTransaction('4');

    expect(service.allTransactions().find(t => t.id === '4')).toBeUndefined();
    // 2245 + 45 = 2290 (since we removed an expense)
    expect(service.totalBalance()).toBe(2290);
  });
});
