import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedTable({ data, columns, onRowClick }) {
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  };

  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '48px 24px', textAlign: 'center',
        border: '1.5px dashed var(--glass-border)', borderRadius: 16, margin: '8px 0',
        color: 'var(--text-muted)', fontSize: 13,
      }}>
        No records found.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
            {columns.map((col, i) => (
              <th key={i} style={{
                padding: '10px 20px',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: 'var(--text-muted)', textAlign: 'left',
                whiteSpace: 'nowrap', backgroundColor: '#f8fafc',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <AnimatePresence>
          <motion.tbody variants={stagger} initial="hidden" animate="show">
            {data.map((row, i) => (
              <motion.tr
                key={row.id || i}
                variants={fadeUp}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.15s',
                }}
                whileHover={{ backgroundColor: '#f1f5f9' }}
              >
                {columns.map((col, j) => (
                  <td key={j} style={{
                    padding: '14px 20px',
                    fontSize: 13, fontWeight: 500, color: 'var(--text)',
                    whiteSpace: 'nowrap',
                  }}>
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
