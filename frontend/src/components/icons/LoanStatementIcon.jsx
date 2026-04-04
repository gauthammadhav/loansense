import React from 'react'
import { motion } from 'framer-motion'
import { FileBarChart } from 'lucide-react'

export default function LoanStatementIcon({ size = 32, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ duration: 0.2 }}
      className={`icon-container ${className}`}
      style={{ position: 'relative', width: size, height: size }}
    >
      <FileBarChart 
        size={size} 
        strokeWidth={2}
        color="var(--warning-dark)"
      />
      
      {/* Animated pulse effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          inset: -4,
          border: '2px solid var(--warning)',
          borderRadius: '8px',
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  )
}
