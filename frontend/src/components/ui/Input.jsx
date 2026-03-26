import React from 'react';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-[var(--radius-input)] border-[1.5px] border-border bg-white px-3 py-2 text-sm text-dark file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-faint focus:outline-none focus:ring-0 focus:border-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';
