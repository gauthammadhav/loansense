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

  const borderColor = error
    ? 'var(--danger)'
    : focused
    ? 'var(--lime)'
    : '#e2e8f0';

  const boxShadow = focused
    ? '0 0 0 3px rgba(200,241,53,0.2), 0 1px 4px rgba(0,0,0,0.06)'
    : '0 1px 3px rgba(0,0,0,0.05)';

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Wrapper box */}
        <div
          style={{
            position: 'relative', width: '100%',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 12,
            backgroundColor: focused ? '#ffffff' : '#f8fafc',
            boxShadow,
            transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Floating label */}
          <motion.label
            initial={false}
            animate={{
              y: focused || hasValue ? -9 : 0,
              scale: focused || hasValue ? 0.72 : 1,
              color: error ? 'var(--danger)' : focused ? 'var(--lime-dark)' : '#94a3b8',
            }}
            style={{
              position: 'absolute',
              left: icon ? 44 : 16,
              top: 16,
              originX: 0,
              fontSize: 14,
              fontWeight: 500,
              pointerEvents: 'none',
              zIndex: 1,
              whiteSpace: 'nowrap',
              transformOrigin: 'left center',
            }}
          >
            {label}
          </motion.label>

          {/* Icon */}
          {icon && (
            <div
              style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: focused ? 'var(--lime-dark)' : '#94a3b8',
                transition: 'color 0.2s',
                display: 'flex', alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </div>
          )}

          {/* Actual Input */}
          <input
            type={currentType}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={maxLength}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              paddingTop: 22,
              paddingBottom: 8,
              paddingLeft: icon ? 44 : 16,
              paddingRight: isPassword ? 44 : 16,
              fontSize: 14,
              color: 'var(--text)',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', display: 'flex', alignItems: 'center',
                padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 500, color: 'var(--danger)',
              paddingLeft: 4,
            }}
          >
            <AlertCircle size={12} /> {error}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Char count */}
      {maxLength && (
        <span style={{
          fontSize: 11, fontFamily: 'monospace', textAlign: 'right', paddingRight: 4,
          color: value?.toString().length >= maxLength ? 'var(--danger)' : '#94a3b8',
        }}>
          {value?.toString().length || 0}/{maxLength}
        </span>
      )}
    </div>
  );
}

export function PasswordInput({ label, showStrength, value, onChange, icon, ...props }) {
  const calculateStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length > 8) score += 30;
    if (/[A-Z]/.test(pw)) score += 20;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  };

  const strength = calculateStrength(value);

  const strengthColor =
    strength < 40 ? 'var(--danger)' :
    strength < 70 ? 'var(--warning)' :
    'var(--success)';

  const strengthLabel =
    strength < 40 ? 'Weak' :
    strength < 70 ? 'Fair' :
    'Strong';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Input label={label} type="password" value={value} onChange={onChange} icon={icon} {...props} />

      {showStrength && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: value ? 1 : 0, height: value ? 'auto' : 0 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ width: '100%', height: 5, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.35 }}
              style={{ height: '100%', borderRadius: 99, backgroundColor: strengthColor, transition: 'background-color 0.3s' }}
            />
          </div>
          <div style={{ fontSize: 11, textAlign: 'right', fontWeight: 600, color: strengthColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {strengthLabel}
          </div>
        </motion.div>
      )}
    </div>
  );
}
