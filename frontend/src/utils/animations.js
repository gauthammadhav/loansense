// frontend/src/utils/animations.js

export const TRANSITIONS = {
  // Page transitions
  pageEnter: {
    duration: 0.6,
    ease: [0.43, 0.13, 0.23, 0.96] // Custom cubic-bezier
  },
  pageExit: {
    duration: 0.4,
    ease: [0.43, 0.13, 0.23, 0.96]
  },
  
  // Element animations
  fadeUp: {
    duration: 0.5,
    ease: "easeOut"
  },
  spring: {
    type: "spring",
    stiffness: 260,
    damping: 20
  },
  smooth: {
    duration: 0.3,
    ease: "easeInOut"
  },
  
  // Micro-interactions
  hover: {
    duration: 0.2,
    ease: "easeOut"
  },
  tap: {
    duration: 0.1,
    ease: "easeInOut"
  }
};

// Stagger delays for lists
export const STAGGER = {
  list: 0.1,      // List items
  cards: 0.15,    // Card grids
  charts: 0.2     // Data visualizations
};

// Common Variants for Framer Motion
export const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: TRANSITIONS.fadeUp
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.cards
    }
  }
};
