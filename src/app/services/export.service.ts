import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Transaction } from '../models/transaction.model';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportTransactionsToExcel(transactions: Transaction[], fileName: string = 'Transacciones.xlsx') {
    if (transactions.length === 0) return;

    // Transform data for Excel
    const data = transactions.map(t => ({
      Fecha: formatDate(t.date, 'dd/MM/yyyy', 'en-US'),
      Concepto: t.title,
      Categoría: t.category,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      Importe: t.amount,
      Cuenta: t.accountId === 'sabadell' ? 'Sabadell' : 'N26',
      Notas: t.comment || ''
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Set column widths (approximate characters)
    const wscols = [
      { wch: 12 }, // Fecha
      { wch: 30 }, // Concepto
      { wch: 15 }, // Categoría
      { wch: 10 }, // Tipo
      { wch: 12 }, // Importe
      { wch: 10 }, // Cuenta
      { wch: 40 }, // Notas
    ];
    ws['!cols'] = wscols;

    // Create workbook and append worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

    // Export file
    XLSX.writeFile(wb, fileName);
  }
}
