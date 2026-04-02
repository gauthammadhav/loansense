import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Button({ 
  children, 
  variant = 'primary', 
  loading = false, 
  icon, 
  onClick, 
  disabled,
  className = '',
  type = 'button',
  ...props 
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  // Magnetic effect
  const handleMouseMove = (e) => {
    if (!ref.current || disabled || loading) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.2;
    const y = (clientY - (top + height / 2)) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Create ripple
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    setRipples([...ripples, { x, y, size, id: Date.now() }]);
    
    // Optional haptic vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
       navigator.vibrate(50);
    }

    if (onClick) onClick(e);
  };

  const baseStyles = 'relative overflow-hidden font-ui font-medium rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 group outline-none';
  
  const variants = {
    primary: 'bg-lime text-dark hover:bg-[#b0d829] shadow-[0_0_15px_rgba(200,241,53,0.2)] focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20',
    ghost: 'bg-transparent text-text-muted hover:text-white hover:bg-white/5',
    danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
  };

  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
  };

  return (
    <motion.button
      type={type}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes.md} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 pointer-events-none">
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
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
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setRipples((r) => r.filter((i) => i.id !== ripple.id))}
            style={{
              position: 'absolute', left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size,
              background: 'rgba(255, 255, 255, 0.3)', borderRadius: '50%', pointerEvents: 'none'
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
