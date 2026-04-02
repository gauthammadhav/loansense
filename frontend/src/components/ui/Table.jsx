import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedTable({ data, columns, onRowClick }) {
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  };

  if(!data || data.length === 0) {
     return (
       <div className="p-12 text-center text-text-muted flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl my-4">
         <span className="text-white/20 mb-2">No records found.</span>
       </div>
     );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-text-muted text-[11px] uppercase tracking-wider font-bold font-mono">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4">{col.label}</th>
            ))}
          </tr>
        </thead>
        <AnimatePresence>
          <motion.tbody variants={stagger} initial="hidden" animate="show" exit="hidden">
            {data.map((row, i) => (
              <motion.tr
                key={row.id || i}
                variants={fadeUp}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-white/5 transition-colors ${onRowClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-sm font-medium text-white/90 whitespace-nowrap">
                    {col.render ? col.render(row) : col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </AnimatePresence>
      </table>
    </div>
  );
}
