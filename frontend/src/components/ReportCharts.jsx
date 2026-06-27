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
  ResponsiveContainer,
} from 'recharts';
import { useSettings } from '../context/SettingsContext.jsx';

const GRID_STROKE = 'rgba(255,255,255,0.07)';
const TICK_STYLE = { fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif' };

const DarkTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: '#f8fafc',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
    }}>
      {label && <p style={{ color: '#94a3b8', marginBottom: 6, fontSize: 12 }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.payload?.fill || '#f8fafc', fontWeight: 600 }}>
          {entry.payload?.name || entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload, formatter }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: '#f8fafc',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{entry.name}</p>
      <p style={{ color: entry.payload?.color || '#a5b4fc' }}>
        {formatter ? formatter(entry.value) : entry.value} · {entry.payload?.percentage}%
      </p>
    </div>
  );
};

const renderPieLabel = ({ cx, cy, midAngle, outerRadius, name, percentage }) => {
  if (percentage < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="#94a3b8"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontFamily="Inter, sans-serif"
    >
      {name} ({percentage}%)
    </text>
  );
};

const BarLegend = ({ items }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, paddingTop: 14 }}>
    {items.map((d) => (
      <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#94a3b8' }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: d.fill, display: 'inline-block', flexShrink: 0 }} />
        {d.name}
      </span>
    ))}
  </div>
);

const ReportCharts = ({ data }) => {
  const { formatCurrency } = useSettings();

  if (!data || !data.expensesByCategory || data.expensesByCategory.length === 0) {
    return null;
  }

  const chartData = data.expensesByCategory.map((cat) => ({
    name: cat.name,
    amount: cat.amount,
    percentage: cat.percentage,
    color: cat.color || '#6366f1',
  }));

  const incomeExpenseData = [
    { name: 'Ingresos', amount: data.totalIncome, fill: '#10b981' },
    { name: 'Gastos',   amount: data.totalExpense, fill: '#f87171' },
  ];

  const barChartAria = `Ingresos ${formatCurrency(data.totalIncome)} vs Gastos ${formatCurrency(data.totalExpense)}. Balance: ${formatCurrency(data.balance)}`;
  const pieChartAria = `Distribución de gastos. ${chartData.map((c) => `${c.name}: ${c.percentage}%`).join('. ')}`;

  return (
    <div className="charts-container">
      {/* Barras: Ingresos vs Gastos */}
      <section className="chart-wrapper" aria-labelledby="bar-chart-title">
        <h3 id="bar-chart-title">Ingresos vs Gastos</h3>
        <div role="img" aria-label={barChartAria} aria-describedby="bar-chart-table" className="chart-visualization">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={incomeExpenseData}
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              aria-hidden="true"
            >
              <CartesianGrid
                stroke={GRID_STROKE}
                strokeDasharray=""
                fill="transparent"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={TICK_STYLE}
                axisLine={{ stroke: GRID_STROKE }}
                tickLine={false}
              />
              <YAxis
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCurrency(v)}
                width={90}
              />
              <Tooltip
                content={<DarkTooltip formatter={formatCurrency} />}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={72}>
                {incomeExpenseData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <BarLegend items={incomeExpenseData} />
        </div>
        <table className="sr-only" id="bar-chart-table">
          <caption>Ingresos vs Gastos</caption>
          <thead><tr><th>Concepto</th><th>Monto</th></tr></thead>
          <tbody>
            <tr><td>Ingresos</td><td>{formatCurrency(data.totalIncome)}</td></tr>
            <tr><td>Gastos</td><td>{formatCurrency(data.totalExpense)}</td></tr>
            <tr><td>Balance</td><td>{formatCurrency(data.balance)}</td></tr>
          </tbody>
        </table>
      </section>

      {/* Donut: Distribución por categoría */}
      {chartData.length > 0 && (
        <section className="chart-wrapper" aria-labelledby="pie-chart-title">
          <h3 id="pie-chart-title">Distribución de Gastos por Categoría</h3>
          <div role="img" aria-label={pieChartAria} aria-describedby="pie-chart-table" className="chart-visualization">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart aria-hidden="true">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="amount"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip formatter={formatCurrency} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" id="pie-chart-table">
            <caption>Gastos por categoría</caption>
            <thead><tr><th>Categoría</th><th>Monto</th><th>%</th></tr></thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i}><td>{row.name}</td><td>{formatCurrency(row.amount)}</td><td>{row.percentage}%</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Tabla de resumen */}
      <section className="chart-wrapper" aria-labelledby="summary-title">
        <h3 id="summary-title">Resumen Detallado</h3>
        <table className="summary-table" role="table" aria-label="Resumen de gastos por categoría">
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col" className="text-right">Monto</th>
              <th scope="col" className="text-right">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i}>
                <td>
                  <span className="category-dot" style={{ backgroundColor: row.color }} aria-hidden="true" />
                  {row.name}
                </td>
                <td className="text-right">{formatCurrency(row.amount)}</td>
                <td className="text-right">{row.percentage}%</td>
              </tr>
            ))}
            <tr className="summary-total">
              <td><strong>Total</strong></td>
              <td className="text-right"><strong>{formatCurrency(data.totalExpense)}</strong></td>
              <td className="text-right"><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ReportCharts;
