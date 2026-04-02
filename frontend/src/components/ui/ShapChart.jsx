import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

export function ShapChart({ data }) {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark2/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-4 min-w-[220px]">
          <p className="font-bold text-white mb-3 text-sm tracking-wide">{data.feature}</p>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-text-muted uppercase tracking-wider">Impact Shift</span>
            <span className={`font-mono font-bold  px-2 py-0.5 rounded-sm ${data.value >= 0 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
              {data.value >= 0 ? '+' : ''}{data.value.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted uppercase tracking-wider">Input Value</span>
            <span className="text-white font-mono font-medium">{data.feature_value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
      className="w-full h-80 mt-2 relative group"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)] pointer-events-none rounded-xl transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="feature" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888896', fontSize: 11, fontFamily: 'var(--font-ui)' }} 
            width={110}
          />
          <Tooltip 
             cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
             content={<CustomTooltip />} 
             animationDuration={200}
          />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1500} animationEasing="ease-out">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value >= 0 ? 'var(--success)' : 'var(--warning)'} 
                className="transition-all duration-300 hover:opacity-80 cursor-crosshair"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
