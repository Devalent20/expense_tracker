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

  it('should initialize with default account Sabadell', () => {
    expect(service.selectedAccount()).toBe('sabadell');
  });

  it('should calculate initial balance correctly for Sabadell', () => {
    // Sabadell Mock Data:
    // Initial: 1000
    // + 2500 (Salario Mensual) 
    // - 150 (Compra Supermercado)
    // - 60 (Cena con amigos)
    // - 100 (Pago Anterior - Previous Month Expense)
    // Total Sabadell = 1000 + 2500 - 150 - 60 - 100 = 3190
    expect(service.totalBalance()).toBe(3190);
  });

  it('should calculate initial balance correctly for N26', () => {
    service.setSelectedAccount('n26');
    // N26 Mock Data:
    // Initial: 0
    // - 45 (Steam Sale)
    // Total N26 = -45
    expect(service.totalBalance()).toBe(-45);
  });

  it('should add a transaction to the current account and update balance', () => {
    service.setSelectedAccount('sabadell');
    const initialBalance = service.totalBalance(); // 3190
    
    service.addTransaction({
      title: 'Test Bizum',
      amount: 50,
      type: 'income',
      category: 'Bizum'
    });

    expect(service.totalBalance()).toBe(initialBalance + 50);
    // 5 original transactions (4 Sabadell + 1 N26) + 1 new = 6 total
    expect(service.allTransactions().length).toBe(6);
    
    // Check it's assigned to Sabadell
    const added = service.allTransactions().find(t => t.title === 'Test Bizum');
    expect(added?.accountId).toBe('sabadell');
  });

  it('should add a transaction to a specific account', () => {
    service.setSelectedAccount('sabadell');
    const initialSabadell = service.totalBalance();
    
    // Add to N26 while on Sabadell
    service.addTransaction({
      title: 'N26 Income',
      amount: 100,
      type: 'income',
      category: 'Ahorros',
      accountId: 'n26'
    });

    // Sabadell balance should NOT change
    expect(service.totalBalance()).toBe(initialSabadell);
    
    // Switch to N26 and check
    service.setSelectedAccount('n26');
    // Previous N26 (-45) + 100 = 55
    expect(service.totalBalance()).toBe(55);
  });

  it('should delete a transaction and update balance', () => {
    service.setSelectedAccount('sabadell');
    // Find ID of 'Cena con amigos' (60 expense) - mock id is '3'
    const initialBalance = service.totalBalance(); // 3190 (assuming fresh state)

    service.deleteTransaction('3');

    // Should increase balance by 60 (since expense removed)
    // 3190 + 60 = 3250
    expect(service.totalBalance()).toBe(initialBalance + 60);
    expect(service.allTransactions().find(t => t.id === '3')).toBeUndefined();
  });

  it('should filter monthly transactions correctly', () => {
    // Current month contains: 
    // Sabadell: Salario (2500 inc), Supermercado (150 exp), Cena (60 exp)
    // N26: Steam Sale (45 exp)
    // Previous Month: Pago Anterior (100 exp, Sabadell)

    service.setSelectedAccount('sabadell');
    // Logic defaults to current month
    const monthly = service.monthlyTransactions();
    
    // Should contain 3 transactions
    expect(monthly.length).toBe(3);
    expect(monthly.some(t => t.title === 'Salario Mensual')).toBeTrue();
    expect(monthly.some(t => t.title === 'Pago Anterior')).toBeFalse(); // Different month
    expect(monthly.some(t => t.title === 'Steam Sale')).toBeFalse(); // Different account
  });

  it('should recalculate opening balance when editing it', () => {
    service.setSelectedAccount('sabadell');
    // Current Opening: 
    // Initial (1000) + Previous Transactions Net (-100) = 900
    expect(service.openingBalance()).toBe(900);

    // Update Opening Balance to 2000
    // Logic: New Initial = Target (2000) - NetBefore (-100) = 2100
    service.updateOpeningBalance(2000);

    // Now opening balance should be 2000
    expect(service.openingBalance()).toBe(2000);
    
    // And total balance should reflect the +1100 difference
    // Was 3190, now should be 3190 + 1100 = 4290
    expect(service.totalBalance()).toBe(4290);
  });
});
