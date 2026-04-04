import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function ScanningIcon({ size = 64 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Document icon */}
      <FileText 
        size={size} 
        strokeWidth={1.5}
        color="var(--text-muted)"
      />
      
      {/* Scanning line */}
      <motion.div
        animate={{
          y: [0, size - 8, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          position: 'absolute',
          left: '10%',
          width: '80%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--lime), transparent)',
          boxShadow: '0 0 8px var(--lime-glow)',
          borderRadius: '1px'
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, var(--lime-glow) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
