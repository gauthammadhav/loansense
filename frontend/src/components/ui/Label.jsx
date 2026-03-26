import React from 'react';

export function Label({ children, className = '', htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={className}
      style={{
        display: 'block',
        fontFamily: 'var(--font-ui)',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-faint)',
        marginBottom: 6,
      }}>
      {children}
    </label>
  );
}
