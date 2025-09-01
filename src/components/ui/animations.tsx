'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ReactNode } from 'react'

// Animation variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

export const slideInFromRight: Variants = {
  initial: {
    x: 100,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const slideInFromLeft: Variants = {
  initial: {
    x: -100,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const scaleIn: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

// Animation components
interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  variants?: Variants
  delay?: number
}

export const AnimatedContainer = ({ 
  children, 
  className, 
  variants = fadeInUp, 
  delay = 0 
}: AnimatedContainerProps) => {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredListProps {
  children: ReactNode
  className?: string
}

export const StaggeredList = ({ children, className }: StaggeredListProps) => {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  )
}

interface StaggeredItemProps {
  children: ReactNode
  className?: string
}

export const StaggeredItem = ({ children, className }: StaggeredItemProps) => {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
    >
      {children}
    </motion.div>
  )
}

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface HoverScaleProps {
  children: ReactNode
  className?: string
  scale?: number
}

export const HoverScale = ({ children, className, scale = 1.02 }: HoverScaleProps) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

interface SlideUpModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const SlideUpModal = ({ children, isOpen, onClose, className }: SlideUpModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface FadeTransitionProps {
  children: ReactNode
  show: boolean
  className?: string
}

export const FadeTransition = ({ children, show, className }: FadeTransitionProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Button animations
export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
}

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
}

// Card animations
export const cardHover = {
  y: -4,
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  transition: { duration: 0.2 }
}

// Loading animations
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
}

export const spinAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }
}