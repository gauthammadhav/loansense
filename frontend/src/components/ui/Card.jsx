import React from 'react';

export function Card({ children, className = '', size = 'default', style: extraStyle = {} }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        padding: size === 'large' ? 28 : 20,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}
