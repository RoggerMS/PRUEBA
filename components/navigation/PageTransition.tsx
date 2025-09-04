'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  variant?: 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'rotate' | 'flip';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  className?: string;
  exitBeforeEnter?: boolean;
  onExitComplete?: () => void;
}

const transitionVariants: { [key: string]: Variants } = {
  slide: {
    initial: (direction: string) => ({
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
      opacity: 0
    }),
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: string) => ({
      x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
      y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    })
  },
  
  fade: {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  },
  
  scale: {
    initial: {
      scale: 0.8,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  },
  
  slideUp: {
    initial: {
      y: 50,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      y: -50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  },
  
  slideDown: {
    initial: {
      y: -50,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  },
  
  rotate: {
    initial: {
      rotateY: -90,
      opacity: 0
    },
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      rotateY: 90,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  },
  
  flip: {
    initial: {
      rotateX: -90,
      opacity: 0
    },
    animate: {
      rotateX: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      rotateX: 90,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  }
};

export function PageTransition({
  children,
  pageKey,
  variant = 'fade',
  direction = 'right',
  duration = 0.3,
  className,
  exitBeforeEnter = true,
  onExitComplete
}: PageTransitionProps) {
  const variants = transitionVariants[variant];

  return (
    <AnimatePresence 
      mode={exitBeforeEnter ? "wait" : "sync"}
      onExitComplete={onExitComplete}
    >
      <motion.div
        key={pageKey}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn("w-full", className)}
        style={{
          transformOrigin: "center",
          backfaceVisibility: "hidden"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered children animation
interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  variant?: 'fadeUp' | 'fadeIn' | 'slideIn' | 'scaleIn';
}

const containerVariants: { [key: string]: Variants } = {
  fadeUp: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  fadeIn: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  },
  slideIn: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  },
  scaleIn: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
};

const childVariants: { [key: string]: Variants } = {
  fadeUp: {
    initial: {
      y: 20,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  },
  fadeIn: {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  },
  slideIn: {
    initial: {
      x: -20,
      opacity: 0
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  },
  scaleIn: {
    initial: {
      scale: 0.8,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }
};

export function StaggeredContainer({
  children,
  className,
  staggerDelay = 0.1,
  variant = 'fadeUp'
}: StaggeredContainerProps) {
  const containerVariant = {
    ...containerVariants[variant],
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariant}
      initial="initial"
      animate="animate"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={childVariants[variant]}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Individual animated item
interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeIn' | 'slideIn' | 'scaleIn';
  delay?: number;
  duration?: number;
}

export function AnimatedItem({
  children,
  className,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.3
}: AnimatedItemProps) {
  const variants = {
    ...childVariants[variant],
    animate: {
      ...childVariants[variant].animate,
      transition: {
        ...childVariants[variant].animate.transition,
        delay,
        duration
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hook for managing page transitions
export function usePageTransition() {
  const [currentPage, setCurrentPage] = React.useState<string>('');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const navigateToPage = React.useCallback((pageKey: string) => {
    if (pageKey === currentPage) return;
    
    setIsTransitioning(true);
    setCurrentPage(pageKey);
  }, [currentPage]);

  const onTransitionComplete = React.useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    currentPage,
    isTransitioning,
    navigateToPage,
    onTransitionComplete
  };
}

// Predefined transition configurations
export const transitionPresets = {
  profileTabs: {
    variant: 'slideUp' as const,
    duration: 0.3,
    exitBeforeEnter: true
  },
  modal: {
    variant: 'scale' as const,
    duration: 0.2,
    exitBeforeEnter: false
  },
  sidebar: {
    variant: 'slide' as const,
    direction: 'left' as const,
    duration: 0.3,
    exitBeforeEnter: false
  },
  cards: {
    variant: 'fadeUp' as const,
    duration: 0.4,
    exitBeforeEnter: true
  }
};

export default PageTransition;