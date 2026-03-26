import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ShapChart({ shapValues }) {
  if (!shapValues || Object.keys(shapValues).length === 0) {
    return (
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)', padding: 16, textAlign: 'center' }}>
        No SHAP data available.
      </div>
    );
  }

  const data = Object.entries(shapValues)
    .map(([feature, value]) => ({
      feature: feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      impact: Number(value),
      absImpact: Math.abs(Number(value)),
    }))
    .sort((a, b) => b.absImpact - a.absImpact)
    .slice(0, 8);

  return (
    <div style={{ height: 260, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
          <XAxis
            type="number"
            tick={{ fill: 'var(--text-faint)', fontSize: 9, fontFamily: 'var(--font-ui)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toFixed(2)}
          />
          <YAxis
            dataKey="feature"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 600 }}
            width={110}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--glass-border)',
              background: '#131318',
              fontSize: 11,
              fontFamily: 'var(--font-body)',
              color: 'var(--text)',
            }}
            labelStyle={{ color: 'var(--text-faint)', fontWeight: 700, marginBottom: 4 }}
            formatter={(value) => [Number(value).toFixed(4), 'SHAP Impact']}
          />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.impact > 0
                  ? 'rgba(74,222,128,0.7)'
                  : 'rgba(248,113,113,0.7)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
