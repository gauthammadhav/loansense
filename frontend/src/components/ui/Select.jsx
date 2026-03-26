import React from 'react';

export const Select = React.forwardRef(({ className = '', children, style: extraStyle = {}, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={className}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--glass-border)',
        borderRadius: 10,
        padding: '11px 36px 11px 14px',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 10px center',
        backgroundSize: '1.2em 1.2em',
        backgroundRepeat: 'no-repeat',
        ...extraStyle,
      }}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';
