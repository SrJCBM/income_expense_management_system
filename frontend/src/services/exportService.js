import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Servicio de Exportación de Reportes
 * Maneja exportación a PDF y Excel con validación y error handling
 * 
 * WCAG 2.1 Compliance:
 * - Valida datos antes de exportar
 * - Proporciona feedback al usuario
 * - Maneja errores gracefully
 * - Accesible desde teclado
 */

/**
 * Valida que los datos sean suficientes para exportar
 * @param {Object} data - Datos a validar
 * @throws {Error} Si falta información crítica
 */
const validateExportData = (data) => {
  if (!data) {
    throw new Error('No hay datos para exportar');
  }
  
  if (typeof data.totalIncome !== 'number' || typeof data.totalExpense !== 'number') {
    throw new Error('Datos de ingresos/gastos inválidos');
  }
  
  if (!Array.isArray(data.expensesByCategory) || data.expensesByCategory.length === 0) {
    throw new Error('No hay datos de categorías para exportar');
  }
  
  return true;
};

/**
 * Exporta reporte a PDF
 * @param {Object} data - Datos del reporte
 * @param {number} month - Mes del reporte (1-12)
 * @param {number} year - Año del reporte
 * @returns {Promise<void>}
 * @throws {Error} Si los datos son inválidos o fallan durante exportación
 */
export const exportToPDF = async (data, month, year) => {
  try {
    validateExportData(data);
    
    if (!month || !year || month < 1 || month > 12) {
      throw new Error('Mes o año inválido');
    }

    // Try to load the autoTable plugin dynamically (optional). If not available, we'll use a fallback.
    try {
      // eslint-disable-next-line no-undef
      await import('jspdf-autotable');
    } catch (err) {
      // plugin not installed — fallback will be used later
      // console.warn('jspdf-autotable not available, using fallback table rendering.');
    }

    const doc = new jsPDF();
    
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthName = monthNames[month - 1];
    const title = `Reporte Financiero - ${monthName} ${year}`;
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(17, 24, 39); // text-primary
    doc.text(title, 20, 20);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 28, 190, 28);
    
    // Resumen
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('RESUMEN FINANCIERO', 20, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Ingresos Totales: $${data.totalIncome.toFixed(2)}`, 20, 50);
    doc.text(`Gastos Totales: $${data.totalExpense.toFixed(2)}`, 20, 60);
    doc.text(`Balance Neto: $${data.balance.toFixed(2)}`, 20, 70);
    
    // Tabla de gastos por categoría
    if (data.expensesByCategory && data.expensesByCategory.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('GASTOS POR CATEGORÍA', 20, 90);
      
      const tableData = data.expensesByCategory.map((cat) => [
        cat.name,
        `$${cat.amount.toFixed(2)}`,
        `${cat.percentage}%`,
      ]);

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 100,
          head: [['Categoría', 'Monto', 'Porcentaje']],
          body: tableData,
          theme: 'grid',
          margin: 20,
          styles: {
            fontSize: 10,
            textColor: 60,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });
      } else {
        // Fallback simple rendering when autoTable isn't available
        let y = 100;
        doc.setFontSize(10);
        tableData.forEach((row) => {
          doc.text(row[0].toString(), 20, y);
          doc.text(row[1].toString(), 110, y);
          doc.text(row[2].toString(), 150, y);
          y += 8;
          if (y > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            y = 20;
          }
        });
      }
    }
    
    // Pie de página
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Guardar PDF
    doc.save(`reporte-financiero-${monthName}-${year}.pdf`);
  } catch (error) {
    const errorMessage = error.message || 'Error desconocido al exportar PDF';
    console.error('Export PDF error:', error);
    throw new Error(errorMessage);
  }
};

/**
 * Exporta reporte a Excel
 * @param {Object} data - Datos del reporte
 * @param {number} month - Mes del reporte (1-12)
 * @param {number} year - Año del reporte
 * @returns {Promise<void>}
 * @throws {Error} Si los datos son inválidos o fallan durante exportación
 */
export const exportToExcel = async (data, month, year) => {
  try {
    validateExportData(data);
    
    if (!month || !year || month < 1 || month > 12) {
      throw new Error('Mes o año inválido');
    }

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthName = monthNames[month - 1];
    
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    
    // Hoja 1: Resumen
    const summaryData = [
      ['REPORTE FINANCIERO', `${monthName} ${year}`],
      [],
      ['Concepto', 'Monto'],
      ['Ingresos Totales', data.totalIncome],
      ['Gastos Totales', data.totalExpense],
      ['Balance Neto', data.balance],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    
    // Hoja 2: Detalles por categoría
    if (data.expensesByCategory && data.expensesByCategory.length > 0) {
      const categoryData = [
        ['GASTOS POR CATEGORÍA'],
        [],
        ['Categoría', 'Monto', 'Porcentaje'],
        ...data.expensesByCategory.map((cat) => [
          cat.name,
          cat.amount,
          `${cat.percentage}%`,
        ]),
      ];
      
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      categorySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría');
    }
    
    // Guardar Excel
    XLSX.writeFile(workbook, `reporte-financiero-${monthName}-${year}.xlsx`);
  } catch (error) {
    const errorMessage = error.message || 'Error desconocido al exportar Excel';
    console.error('Export Excel error:', error);
    throw new Error(errorMessage);
  }
};

export default {
  exportToPDF,
  exportToExcel,
  validateExportData,
};
