import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

export default function TrustShieldIcon({ score, size = 48 }) {
  const getColor = () => {
    if (score >= 80) return 'var(--success)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Circular progress background */}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 4}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth="3"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 4}
          fill="none"
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ strokeDasharray: 0, strokeDashoffset: 0 }}
          animate={{
            strokeDasharray: `${2 * Math.PI * ((size / 2) - 4)}`,
            strokeDashoffset: `${2 * Math.PI * ((size / 2) - 4) * (1 - score / 100)}`
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Shield icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)' // Fixed placement, the SVG surrounds it
        }}
      >
        <ShieldCheck 
          size={size * 0.5} 
          strokeWidth={2}
          color={getColor()}
        />
      </motion.div>
      
      {/* Score text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap'
        }}
      >
        {score.toFixed(0)}% Trust
      </motion.div>
    </div>
  )
}
