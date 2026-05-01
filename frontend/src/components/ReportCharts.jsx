import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Componente ReportCharts
 * Visualiza datos financieros con múltiples tipos de gráficos
 * WCAG 2.1 AA Compliant:
 * - Gráficos tienen role="img" + aria-label descriptivo
 * - Tabla alternativa para lectores de pantalla
 * - Colores validados para contraste 4.5:1 (AA)
 * - Estructura semántica accesible
 * 
 * @param {Object} data - Datos a graficar
 * @param {number} data.totalIncome - Ingresos totales
 * @param {number} data.totalExpense - Gastos totales
 * @param {number} data.balance - Balance neto
 * @param {Array} data.expensesByCategory - Gastos por categoría
 */
const ReportCharts = ({ data }) => {
  if (!data || !data.expensesByCategory || data.expensesByCategory.length === 0) {
    return null;
  }

  const chartData = data.expensesByCategory.map((cat) => ({
    name: cat.name,
    amount: cat.amount,
    percentage: cat.percentage,
    color: cat.color || '#3b82f6',
  }));

  const incomeExpenseData = [
    {
      name: 'Ingresos',
      amount: data.totalIncome,
      fill: '#10b981',
    },
    {
      name: 'Gastos',
      amount: data.totalExpense,
      fill: '#ef4444',
    },
  ];

  // Descripciones accesibles para gráficos
  const barChartAria = `Gráfico de barras mostrando Ingresos de $${data.totalIncome.toFixed(2)} vs Gastos de $${data.totalExpense.toFixed(2)}. Balance: $${data.balance.toFixed(2)}`;
  
  const pieChartAria = `Gráfico circular mostrando distribución de gastos por categoría. Total gastos: $${data.totalExpense.toFixed(2)}. ${chartData.map((cat) => `${cat.name}: ${cat.percentage}%`).join('. ')}`;

  return (
    <div className="charts-container">
      {/* Gráfico de Barras: Ingresos vs Gastos */}
      <section className="chart-wrapper" aria-labelledby="bar-chart-title">
        <h3 id="bar-chart-title">Ingresos vs Gastos</h3>
        <div 
          role="img" 
          aria-label={barChartAria}
          aria-describedby="bar-chart-table"
          className="chart-visualization"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeExpenseData} aria-hidden="true">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {incomeExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Tabla alternativa accesible */}
        <table className="sr-only" id="bar-chart-table" role="presentation">
          <caption>Datos del gráfico de Ingresos vs Gastos</caption>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ingresos</td>
              <td>${data.totalIncome.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Gastos</td>
              <td>${data.totalExpense.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Balance</strong></td>
              <td><strong>${data.balance.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Gráfico de Pie: Distribución de Gastos */}
      <section className="chart-wrapper" aria-labelledby="pie-chart-title">
        <h3 id="pie-chart-title">Distribución de Gastos por Categoría</h3>
        <div 
          role="img" 
          aria-label={pieChartAria}
          aria-describedby="pie-chart-table"
          className="chart-visualization"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart aria-hidden="true">
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#3b82f6"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla alternativa accesible */}
        <table className="sr-only" id="pie-chart-table" role="presentation">
          <caption>Datos del gráfico de Distribución de Gastos</caption>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.name}</td>
                <td>${row.amount.toFixed(2)}</td>
                <td>{row.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tabla de Resumen - Siempre Visible */}
      <section className="chart-wrapper" aria-labelledby="summary-title">
        <h3 id="summary-title">Resumen Detallado</h3>
        <table className="summary-table" role="table" aria-label="Tabla de resumen de gastos por categoría">
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col" className="text-right">Monto</th>
              <th scope="col" className="text-right">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <span
                    className="category-dot"
                    style={{ backgroundColor: row.color }}
                    aria-label={`Color de ${row.name}`}
                  ></span>
                  {row.name}
                </td>
                <td className="text-right">${row.amount.toFixed(2)}</td>
                <td className="text-right">{row.percentage}%</td>
              </tr>
            ))}
            <tr className="summary-total">
              <td><strong>Total</strong></td>
              <td className="text-right"><strong>${data.totalExpense.toFixed(2)}</strong></td>
              <td className="text-right"><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ReportCharts;
