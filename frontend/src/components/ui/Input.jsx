import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  icon, 
  error,
  maxLength,
  className = '',
  ...props 
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  
  const currentType = isPassword && showPassword ? 'text' : type;

  return (
    <motion.div className={`relative w-full flex flex-col gap-1 ${className}`} layout>
      <div className="relative flex items-center w-full">
        {/* Glow effect */}
        <AnimatePresence>
          {focused && (
            <motion.div
              layoutId="inputGlow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 -z-10 rounded-xl bg-lime/20 blur-md transition-all pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Input Wrapper */}
        <div className={`relative w-full border rounded-xl overflow-hidden bg-white/5 backdrop-blur-md transition-colors ${focused ? 'border-lime shadow-[0_0_10px_rgba(200,241,53,0.3)]' : error ? 'border-danger' : 'border-white/10'}`}>
          
          <motion.label
            initial={false}
            animate={{
              y: focused || hasValue ? -10 : 0,
              scale: focused || hasValue ? 0.75 : 1,
              color: error ? 'var(--danger)' : focused ? 'var(--lime)' : 'var(--text-muted)'
            }}
            className={`absolute ${icon ? 'left-10' : 'left-4'} top-3 origin-left pointer-events-none transition-colors z-10 w-[calc(100%-2rem)] truncate`}
          >
            {label}
          </motion.label>

          {icon && (
            <div className={`absolute left-4 top-3 transition-colors ${focused ? 'text-lime' : 'text-text-muted'} pointer-events-none`}>
              {icon}
            </div>
          )}

          <input
            type={currentType}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={maxLength}
            className={`w-full bg-transparent text-white pt-6 pb-2 outline-none ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute right-4 top-3 text-text-muted hover:text-white transition-colors outline-none cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center px-1 text-xs min-h-[16px]">
         {/* Error msg */}
         <AnimatePresence>
           {error && (
             <motion.span
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="text-danger flex items-center gap-1 font-medium"
             >
               <AlertCircle size={12} /> {error}
             </motion.span>
           )}
         </AnimatePresence>

         {/* Char Count */}
         {maxLength && (
           <span className={`transition-colors font-mono tracking-wider ${value?.toString().length >= maxLength ? 'text-danger' : 'text-text-faint'} ml-auto`}>
             {value?.toString().length || 0}/{maxLength}
           </span>
         )}
      </div>
    </motion.div>
  );
}

// Password Strength component helper class
export function PasswordInput({ label, showStrength, value, onChange, icon, ...props }) {
  const calculateStrength = (pw) => {
    if(!pw) return 0;
    let score = 0;
    if(pw.length > 8) score += 30;
    if(/[A-Z]/.test(pw)) score += 20;
    if(/[0-9]/.test(pw)) score += 25;
    if(/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  };

  const strength = calculateStrength(value);

  return (
    <div className="w-full flex flex-col gap-2">
      <Input label={label} type="password" value={value} onChange={onChange} icon={icon} {...props} />
      
      {showStrength && (
        <motion.div 
          className="w-full flex flex-col gap-1 mt-1"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: value ? 1 : 0, height: value ? 'auto' : 0 }}
        >
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              style={{
                background: strength < 40 ? 'var(--danger)' : strength < 70 ? 'var(--warning)' : 'var(--success)',
                boxShadow: strength < 40 ? '0 0 10px var(--danger)' : strength < 70 ? '0 0 10px var(--warning)' : '0 0 10px var(--success)'
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-right text-text-muted font-medium uppercase tracking-wider">
            {strength < 40 ? 'Weak' : strength < 70 ? 'Fair' : 'Strong'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
