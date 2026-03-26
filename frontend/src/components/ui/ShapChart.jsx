import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ShapChart({ shapValues }) {
  if (!shapValues || Object.keys(shapValues).length === 0) return <div className="text-sm text-muted">No SHAP data available.</div>;

  // Convert shap object to array and sort by absolute impact
  const data = Object.entries(shapValues)
    .map(([feature, value]) => ({
      feature: feature.replace(/_/g, ' ').toUpperCase(),
      impact: Number(value),
      absImpact: Math.abs(Number(value))
    }))
    .sort((a, b) => b.absImpact - a.absImpact)
    .slice(0, 8); // Max 8 features per PRD

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            dataKey="feature" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'var(--dark)', fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 'bold' }}
            width={120}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-body)' }}
            formatter={(value) => [Number(value).toFixed(4), "Impact"]}
          />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.impact > 0 ? 'var(--chart-approve)' : 'var(--chart-reject)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
