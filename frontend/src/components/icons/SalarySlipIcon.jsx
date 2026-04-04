import React from 'react'
import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'

export default function SalarySlipIcon({ size = 32, className = '' }) {
  return (
    <div className={`icon-container ${className}`} style={{ position: 'relative', width: size, height: size }}>
      {/* Receipt base */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Receipt 
          size={size} 
          strokeWidth={2}
          color="var(--lime-dark)"
        />
      </motion.div>
      
      {/* Currency symbol overlay */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '50%',
          width: size * 0.4,
          height: size * 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontWeight: 700,
          fontSize: size * 0.25,
          color: 'var(--success)'
        }}
      >
        ₹
      </motion.div>
    </div>
  )
}
