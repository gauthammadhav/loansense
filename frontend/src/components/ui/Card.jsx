import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export function Card({ children, title, icon, badge, interactive = false, style: extraStyle = {}, ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={interactive ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--glass-border)',
        borderRadius: 20,
        padding: 28,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: interactive ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...extraStyle,
      }}
      {...props}
    >
      {(title || icon || badge) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            {icon && <span style={{ color: 'var(--lime-dark)', display: 'flex' }}>{icon}</span>}
            {title}
          </h3>
          {badge && <div>{badge}</div>}
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
}

export function ActionCard({ title, description, icon, onClick, glowColor = 'var(--lime)' }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
      onClick={onClick}
      style={{
        backgroundColor: 'white', border: '1px solid var(--glass-border)',
        borderRadius: 20, padding: 28, cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{
        position: 'absolute', top: -24, right: -24, width: 100, height: 100,
        backgroundColor: glowColor, borderRadius: '50%', opacity: 0.08, filter: 'blur(24px)', pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          border: '1px solid var(--glass-border)', backgroundColor: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime-dark)',
        }}>
          {icon}
        </div>
        <div>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: '0 0 4px 0' }}>{title}</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
