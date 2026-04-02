import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export function Card({ 
  children, 
  title, 
  icon, 
  badge,
  interactive = false,
  className = '',
  ...props 
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={interactive ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card ${interactive ? 'interactive cursor-pointer' : ''} p-6 flex flex-col gap-4 ${className}`}
      {...props}
    >
      {(title || icon || badge) && (
        <div className="flex justify-between items-center mb-2 relative z-10">
          <h3 className="text-white/90 font-bold text-lg flex items-center gap-2">
            {icon && <span className="text-lime">{icon}</span>}
            {title}
          </h3>
          {badge && <div>{badge}</div>}
        </div>
      )}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.div>
  );
}

export function ActionCard({ title, description, icon, onClick, glowColor = 'var(--lime)' }) {
  return (
    <Card interactive onClick={onClick} className="group overflow-hidden">
       {/* Animated border using pseudo element simulation */}
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--glow-color)] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl pointer-events-none" style={{ '--glow-color': glowColor }} />
       <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 text-white/50 group-hover:text-lime transition-colors">
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-lg text-white group-hover:text-lime transition-colors">{title}</h4>
            <p className="text-sm text-text-muted">{description}</p>
          </div>
       </div>
    </Card>
  )
}
