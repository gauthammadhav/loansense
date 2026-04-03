import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const VARIANT_MAP = {
  default:  { bg: '#f1f5f9',                        color: 'var(--text)',         border: '#e2e8f0' },
  success:  { bg: 'rgba(34,197,94,0.1)',             color: 'var(--success-dark)', border: 'rgba(34,197,94,0.3)' },
  danger:   { bg: 'rgba(248,113,113,0.1)',           color: 'var(--danger-dark)',  border: 'rgba(248,113,113,0.3)' },
  warning:  { bg: 'rgba(251,191,36,0.1)',            color: '#92400e',             border: 'rgba(251,191,36,0.4)' },
  info:     { bg: 'rgba(59,130,246,0.08)',           color: '#1e40af',             border: 'rgba(59,130,246,0.25)' },
  lime:     { bg: 'rgba(200,241,53,0.15)',           color: 'var(--lime-dark)',    border: 'var(--lime)' },
  outline:  { bg: 'transparent',                    color: 'var(--text-muted)',   border: 'var(--glass-border)' },
};

export function Badge({ children, variant = 'default', pulse = false, icon, onRemove, size = 'md' }) {
  const v = VARIANT_MAP[variant] || VARIANT_MAP.default;

  const sizeStyle = size === 'sm'
    ? { fontSize: 10, padding: '2px 8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }
    : size === 'lg'
    ? { fontSize: 13, padding: '4px 12px', fontWeight: 500 }
    : { fontSize: 11, padding: '3px 10px', fontWeight: 600 };

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: `1px solid ${v.border}`,
          borderRadius: 99, padding: sizeStyle.padding,
          backgroundColor: v.bg, color: v.color,
          fontSize: sizeStyle.fontSize, fontWeight: sizeStyle.fontWeight,
          letterSpacing: sizeStyle.letterSpacing, textTransform: sizeStyle.textTransform,
          position: 'relative', overflow: 'hidden', flexShrink: 0,
          lineHeight: 1.4,
        }}
      >
        {pulse && (
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.25, 0, 0.25] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'currentColor', opacity: 0.15, transformOrigin: 'center' }}
          />
        )}
        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
          {icon && <span style={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}>{icon}</span>}
          {children}
          {onRemove && (
            <button
              onClick={onRemove}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2, color: 'inherit', display: 'flex', alignItems: 'center', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={11} />
            </button>
          )}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
