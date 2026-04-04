import React from 'react'
import { motion } from 'framer-motion'
import { Upload, Cloud } from 'lucide-react'

export default function UploadCloudIcon({ size = 24, isUploading = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Cloud base */}
      <Cloud 
        size={size} 
        strokeWidth={2}
        color="var(--lime-dark)"
        style={{ opacity: 0.3 }}
      />
      
      {/* Upload arrow */}
      <motion.div
        animate={isUploading ? {
          y: [-4, 4, -4],
          opacity: [1, 0.5, 1]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Upload 
          size={size * 0.6} 
          strokeWidth={2.5}
          color="var(--lime)"
        />
      </motion.div>
    </div>
  )
}
