import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-page text-dark border-border',
    approved: 'bg-success-bg text-success border-success/20',
    rejected: 'bg-danger-bg text-danger border-danger/20',
    review: 'bg-warning-bg text-warning border-warning/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-body border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
