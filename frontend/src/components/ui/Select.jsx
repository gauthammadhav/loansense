import React from 'react';

export const Select = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-[var(--radius-input)] border-[1.5px] border-border bg-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-0 focus:border-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B6B6B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
      }}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';
