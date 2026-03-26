import React from 'react';

const STATUS_STYLES = {
  approved:     { bg: 'rgba(74,222,128,0.08)',  color: '#4ADE80' },
  rejected:     { bg: 'rgba(248,113,113,0.08)', color: '#F87171' },
  under_review: { bg: 'rgba(251,191,36,0.08)',  color: '#FBBF24' },
  submitted:    { bg: 'rgba(129,140,248,0.08)', color: '#818CF8' },
  escalated:    { bg: 'rgba(251,146,60,0.08)',  color: '#FB923C' },
  pending:      { bg: 'rgba(129,140,248,0.08)', color: '#818CF8' },
  default:      { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' },
};

export function Badge({ status, children, className = '' }) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '_');
  const { bg, color } = STATUS_STYLES[key] || STATUS_STYLES.default;
  const label = children || status || '';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: bg,
        color,
        fontFamily: 'var(--font-ui)',
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '3px 9px',
        borderRadius: 'var(--radius-badge)',
        whiteSpace: 'nowrap',
      }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}
