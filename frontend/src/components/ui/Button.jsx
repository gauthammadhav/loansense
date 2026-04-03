import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VARIANT_STYLES = {
  primary: {
    backgroundColor: 'var(--lime)',
    color: 'var(--text)',
    border: 'none',
    boxShadow: '0 2px 8px rgba(200,241,53,0.4)',
  },
  secondary: {
    backgroundColor: 'white',
    color: 'var(--text)',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    color: 'var(--danger-dark)',
    border: '1px solid rgba(248,113,113,0.3)',
    boxShadow: 'none',
  },
};

const HOVER_STYLES = {
  primary: { backgroundColor: 'var(--lime-dark)', boxShadow: '0 4px 16px rgba(200,241,53,0.5)' },
  secondary: { backgroundColor: '#f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  ghost: { backgroundColor: 'var(--light3)', color: 'var(--text)' },
  danger: { backgroundColor: 'rgba(248,113,113,0.15)' },
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  icon,
  onClick,
  disabled,
  className = '',
  type = 'button',
  style: extraStyle = {},
  ...props
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current || disabled || loading) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    setPosition({ x: (clientX - (left + width / 2)) * 0.18, y: (clientY - (top + height / 2)) * 0.18 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setHovered(false);
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    setRipples(r => [...r, { x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size, id: Date.now() }]);
    if (onClick) onClick(e);
  };

  const base = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const hover = HOVER_STYLES[variant] || {};

  return (
    <motion.button
      type={type}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      onClick={handleClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      style={{
        position: 'relative', overflow: 'hidden',
        height: 44, padding: '0 24px', borderRadius: 12,
        fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s, box-shadow 0.15s, color 0.15s',
        outline: 'none',
        ...(hovered && !disabled && !loading ? { ...base, ...hover } : base),
        ...extraStyle,
      }}
      {...props}
    >
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
        {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
        {children}
      </span>

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onAnimationComplete={() => setRipples(r => r.filter(i => i.id !== ripple.id))}
            style={{
              position: 'absolute', left: ripple.x, top: ripple.y,
              width: ripple.size, height: ripple.size,
              background: 'rgba(255,255,255,0.35)', borderRadius: '50%', pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
