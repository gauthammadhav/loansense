import React from 'react';

export function Label({ children, className = '', htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-[13px] font-bold font-body text-dark tracking-wide mb-1.5 block ${className}`}
    >
      {children}
    </label>
  );
}
