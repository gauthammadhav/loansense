import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CreditCard } from 'lucide-react'

export default function CreditReportIcon({ size = 32, className = '' }) {
  return (
    <div className={`icon-container ${className}`} style={{ position: 'relative', width: size, height: size }}>
      {/* Credit card background */}
      <motion.div
        whileHover={{ rotateY: 15 }}
        transition={{ duration: 0.3 }}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        <CreditCard 
          size={size} 
          strokeWidth={1.8}
          color="var(--info)"
        />
      </motion.div>
      
      {/* Trending up overlay */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          background: 'var(--success)',
          borderRadius: '50%',
          padding: size * 0.08,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        <TrendingUp 
          size={size * 0.35} 
          strokeWidth={2.5}
          color="white"
        />
      </motion.div>
    </div>
  )
}
