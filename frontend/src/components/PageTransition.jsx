import React from 'react';
import { motion } from 'framer-motion';
import { TRANSITIONS } from '../utils/animation-constants';

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={TRANSITIONS.pageEnter}
    >
      {children}
    </motion.div>
  );
}
