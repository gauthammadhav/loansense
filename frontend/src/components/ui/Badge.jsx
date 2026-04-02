import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Badge({ 
  children, 
  variant = 'default', 
  pulse = false, 
  icon, 
  onRemove,
  size = 'md',
  className = ''
}) {
  const variants = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]',
    danger: 'bg-danger/10 text-danger border-danger/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]',
    warning: 'bg-warning/10 text-warning border-warning/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
    info: 'bg-info/10 text-info border-info/30 shadow-[0_0_10px_rgba(129,140,248,0.2)]',
    lime: 'bg-lime/10 text-lime border-lime/30 shadow-[0_0_10px_rgba(200,241,53,0.2)]',
    outline: 'bg-transparent text-text-muted border-white/20'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1 font-medium',
  };

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className={`inline-flex items-center gap-1.5 border rounded-full relative overflow-hidden shrink-0 ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {pulse && (
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-0 bg-current opacity-20 origin-center`}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          {icon && <span className="opacity-80 flex items-center">{icon}</span>}
          {children}
          {onRemove && (
            <button 
              onClick={onRemove}
              className="hover:scale-125 hover:text-white transition-all ml-1 outline-none pointer-events-auto cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
