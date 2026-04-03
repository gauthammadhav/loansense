import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

export function ShapChart({ data }) {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white', border: '1px solid var(--glass-border)',
          borderRadius: 12, padding: '14px 16px', minWidth: 220,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}>
          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontSize: 13, margin: '0 0 10px 0' }}>
            {item.feature}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Impact Shift</span>
            <span style={{
              fontWeight: 700, fontFamily: 'monospace', fontSize: 12,
              padding: '2px 8px', borderRadius: 6,
              backgroundColor: item.value >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
              color: item.value >= 0 ? 'var(--success-dark)' : '#92400e',
            }}>
              {item.value >= 0 ? '+' : ''}{item.value.toFixed(4)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Input Value</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{item.feature_value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', delay: 0.2 }}
      style={{ width: '100%', height: 320, marginTop: 8, position: 'relative' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 24, left: 130, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="feature"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'var(--font-ui)' }}
            width={120}
          />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<CustomTooltip />} animationDuration={200} />
          <ReferenceLine x={0} stroke="#e2e8f0" strokeDasharray="4 4" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1400} animationEasing="ease-out">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? 'var(--success)' : 'var(--warning)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
