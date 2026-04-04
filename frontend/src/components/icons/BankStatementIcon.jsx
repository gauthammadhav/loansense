import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function BankStatementIcon({ size = 32, className = '' }) {
  return (
    <div className={`icon-container ${className}`} style={{ position: 'relative', width: size, height: size }}>
      {/* Background layer - faded document */}
      <motion.div
        initial={{ opacity: 0.3, x: -2, y: 2 }}
        animate={{ opacity: 0.3 }}
        style={{
          position: 'absolute',
          top: 4,
          left: -4
        }}
      >
        <FileText 
          size={size} 
          strokeWidth={1.5}
          color="var(--text-muted)"
        />
      </motion.div>
      
      {/* Middle layer */}
      <motion.div
        initial={{ opacity: 0.5, x: -1, y: 1 }}
        animate={{ opacity: 0.5 }}
        style={{
          position: 'absolute',
          top: 2,
          left: -2
        }}
      >
        <FileText 
          size={size} 
          strokeWidth={1.5}
          color="var(--lime-dark)"
        />
      </motion.div>
      
      {/* Front layer - primary document */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <FileText 
          size={size} 
          strokeWidth={2}
          color="var(--lime)"
        />
      </motion.div>
      
      {/* Subtle gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, var(--lime-glow) 0%, transparent 100%)',
        borderRadius: '4px',
        pointerEvents: 'none',
        opacity: 0.2
      }} />
    </div>
  )
}
