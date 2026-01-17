import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { Transaction } from '../models/transaction.model';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  async exportTransactionsToExcel(transactions: Transaction[], fileName: string = 'Transacciones.xlsx', sheetName: string = 'Resumen') {
    if (transactions.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    // Sheet name must not exceed 31 characters
    const safeSheetName = sheetName.substring(0, 31);
    const worksheet = workbook.addWorksheet(safeSheetName);

    // Prepare rows
    const rows = transactions.map(t => [
      formatDate(t.date, 'dd/MM/yyyy', 'en-US'),
      t.title,
      t.amount,
      t.category,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.accountId === 'sabadell' ? 'Sabadell' : 'N26',
      t.comment || ''
    ]);

    // Add Table
    worksheet.addTable({
      name: 'Transacciones',
      ref: 'A1',
      headerRow: true,
      style: {
        theme: 'TableStyleMedium2', // Nice blue theme similar to user's second image
        showRowStripes: true,
      },
      columns: [
        { name: 'Fecha', filterButton: false },
        { name: 'Concepto', filterButton: true },
        { name: 'Importe', filterButton: false },
        { name: 'Categoría', filterButton: true },
        { name: 'Tipo', filterButton: true },
        { name: 'Cuenta', filterButton: true },
        { name: 'Notas', filterButton: true },
      ],
      rows: rows,
    });

    // Set Column Widths (addTable doesn't set widths)
    worksheet.columns = [
      { width: 15 }, // Fecha
      { width: 25 }, // Concepto
      { width: 15 }, // Importe
      { width: 18 }, // Categoría
      { width: 12 }, // Tipo
      { width: 12 }, // Cuenta
      { width: 40 }  // Notas
    ];

    // Apply Currency Format to Amount Column (Column C)
    worksheet.getColumn('C').numFmt = '#,##0.00" €"';
    worksheet.getColumn('C').alignment = { horizontal: 'left' };

    // Format Date Column alignment
    worksheet.getColumn('A').alignment = { horizontal: 'center' };

    // Center all header titles
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    this.saveAsExcelFile(buffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(data);
    link.href = url;
    link.download = fileName;
    link.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }
}
