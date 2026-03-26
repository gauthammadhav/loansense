import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  style: extraStyle = {},
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 'var(--radius-btn)',
    padding: '10px 20px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s',
    letterSpacing: '0.2px',
  };

  const variants = {
    primary: {
      background: 'var(--lime)',
      color: 'var(--dark)',
    },
    secondary: {
      background: 'var(--glass)',
      color: 'var(--text)',
      border: '1px solid var(--glass-border)',
    },
    danger: {
      background: 'rgba(248,113,113,0.05)',
      color: 'var(--danger)',
      border: '1px solid rgba(248,113,113,0.2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid var(--glass-border)',
    },
  };

  const hoverMap = {
    primary: { y: -1, boxShadow: '0 4px 20px rgba(200,241,53,0.3)' },
    secondary: { backgroundColor: 'var(--glass-hover)' },
    danger: { backgroundColor: 'rgba(248,113,113,0.12)' },
    ghost: { backgroundColor: 'var(--glass)' },
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? hoverMap[variant] : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{ ...base, ...variants[variant], ...extraStyle }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
