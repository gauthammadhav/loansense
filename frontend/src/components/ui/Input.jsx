import React from 'react';

export function Input({ className = '', style: extraStyle = {}, ...props }) {
  const [focused, setFocused] = React.useState(false);

  return (
    <input
      {...props}
      className={className}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        width: '100%',
        background: focused ? 'rgba(200,241,53,0.03)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(200,241,53,0.4)' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius-input)',
        padding: '11px 14px',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        ...extraStyle,
      }}
    />
  );
}
