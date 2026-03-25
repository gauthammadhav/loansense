import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-[var(--radius-card)] border border-border p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
