'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  User,
  FileText,
  Trophy,
  Users,
  Settings,
  Activity,
  BookOpen,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  MapPin,
  Globe
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
  badge?: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  showCounts?: boolean;
  animated?: boolean;
}

const tabVariants = {
  default: {
    base: "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md",
    active: "bg-blue-100 text-blue-700",
    inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  },
  pills: {
    base: "relative px-6 py-3 text-sm font-medium transition-all duration-200 rounded-full",
    active: "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg",
    inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  },
  underline: {
    base: "relative px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 border-transparent",
    active: "text-blue-600 border-blue-600",
    inactive: "text-gray-600 hover:text-gray-900 hover:border-gray-300"
  },
  cards: {
    base: "relative px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg border",
    active: "bg-white text-blue-600 border-blue-200 shadow-md",
    inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200"
  }
};

const sizeVariants = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-3"
};

export function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className,
  tabClassName,
  activeTabClassName,
  showCounts = true,
  animated = true
}: AnimatedTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [tabPositions, setTabPositions] = useState<{ [key: string]: { left: number; width: number; top: number; height: number } }>({});
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePositions = () => {
      const positions: typeof tabPositions = {};
      Object.entries(tabsRef.current).forEach(([tabId, element]) => {
        if (element && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          positions[tabId] = {
            left: elementRect.left - containerRect.left,
            width: elementRect.width,
            top: elementRect.top - containerRect.top,
            height: elementRect.height
          };
        }
      });
      setTabPositions(positions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [tabs, activeTab]);

  const activePosition = tabPositions[activeTab];
  const hoveredPosition = hoveredTab ? tabPositions[hoveredTab] : null;

  const containerClasses = cn(
    "relative flex",
    orientation === 'horizontal' ? "flex-row" : "flex-col",
    variant === 'cards' ? "gap-2 p-1 bg-gray-100 rounded-lg" : "gap-1",
    className
  );

  const getTabClasses = (tab: TabItem, isActive: boolean) => {
    const variantStyles = tabVariants[variant];
    return cn(
      variantStyles.base,
      sizeVariants[size],
      isActive ? variantStyles.active : variantStyles.inactive,
      tab.disabled && "opacity-50 cursor-not-allowed",
      tabClassName,
      isActive && activeTabClassName
    );
  };

  const handleTabClick = (tab: TabItem) => {
    if (!tab.disabled) {
      onTabChange(tab.id);
    }
  };

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Background indicator */}
      {animated && activePosition && variant !== 'underline' && (
        <motion.div
          className={cn(
            "absolute z-0",
            variant === 'pills' 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"
              : variant === 'cards'
              ? "bg-white rounded-lg shadow-md border border-blue-200"
              : "bg-blue-100 rounded-md"
          )}
          initial={false}
          animate={{
            left: activePosition.left,
            width: activePosition.width,
            top: orientation === 'vertical' ? activePosition.top : undefined,
            height: orientation === 'vertical' ? activePosition.height : undefined
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          style={{
            height: orientation === 'horizontal' ? activePosition.height : undefined
          }}
        />
      )}

      {/* Hover indicator */}
      {animated && hoveredPosition && hoveredTab !== activeTab && (
        <motion.div
          className={cn(
            "absolute z-0 opacity-50",
            variant === 'pills' 
              ? "bg-gray-200 rounded-full"
              : variant === 'cards'
              ? "bg-gray-100 rounded-lg border border-gray-200"
              : "bg-gray-100 rounded-md"
          )}
          initial={false}
          animate={{
            left: hoveredPosition.left,
            width: hoveredPosition.width,
            top: orientation === 'vertical' ? hoveredPosition.top : undefined,
            height: orientation === 'vertical' ? hoveredPosition.height : undefined
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40
          }}
          style={{
            height: orientation === 'horizontal' ? hoveredPosition.height : undefined
          }}
        />
      )}

      {/* Underline indicator for underline variant */}
      {animated && variant === 'underline' && activePosition && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-blue-600 z-10"
          initial={false}
          animate={{
            left: activePosition.left,
            width: activePosition.width
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
      )}

      {/* Tab buttons */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        
        return (
          <motion.button
            key={tab.id}
            ref={(el) => {
              tabsRef.current[tab.id] = el;
            }}
            className={getTabClasses(tab, isActive)}
            onClick={() => handleTabClick(tab)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            disabled={tab.disabled}
            whileHover={animated ? { scale: 1.02 } : undefined}
            whileTap={animated ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.1 }}
          >
            <div className="relative z-10 flex items-center gap-2">
              {tab.icon && (
                <motion.div
                  animate={isActive && animated ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {tab.icon}
                </motion.div>
              )}
              
              <span className={cn(
                "font-medium",
                variant === 'pills' && isActive ? "text-white" : ""
              )}>
                {tab.label}
              </span>
              
              {showCounts && tab.count !== undefined && (
                <motion.span
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full font-medium",
                    variant === 'pills' && isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-200 text-gray-600"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {tab.count > 999 ? '999+' : tab.count}
                </motion.span>
              )}
              
              {tab.badge && (
                <motion.span
                  className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-medium"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.2 
                  }}
                >
                  {tab.badge}
                </motion.span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// Predefined tab configurations for common use cases
export const profileTabs: TabItem[] = [
  {
    id: 'overview',
    label: 'Resumen',
    icon: <User className="w-4 h-4" />
  },
  {
    id: 'posts',
    label: 'Posts',
    icon: <FileText className="w-4 h-4" />,
    count: 24
  },
  {
    id: 'achievements',
    label: 'Logros',
    icon: <Trophy className="w-4 h-4" />,
    count: 12
  },
  {
    id: 'social',
    label: 'Social',
    icon: <Users className="w-4 h-4" />,
    count: 156
  },
  {
    id: 'activity',
    label: 'Actividad',
    icon: <Activity className="w-4 h-4" />
  }
];

export const socialTabs: TabItem[] = [
  {
    id: 'followers',
    label: 'Seguidores',
    icon: <Users className="w-4 h-4" />,
    count: 1234
  },
  {
    id: 'following',
    label: 'Siguiendo',
    icon: <User className="w-4 h-4" />,
    count: 567
  },
  {
    id: 'likes',
    label: 'Me gusta',
    icon: <Heart className="w-4 h-4" />,
    count: 89
  },
  {
    id: 'comments',
    label: 'Comentarios',
    icon: <MessageSquare className="w-4 h-4" />,
    count: 45
  }
];

export const settingsTabs: TabItem[] = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: <User className="w-4 h-4" />
  },
  {
    id: 'privacy',
    label: 'Privacidad',
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: <Activity className="w-4 h-4" />,
    badge: '3'
  },
  {
    id: 'social',
    label: 'Social',
    icon: <Globe className="w-4 h-4" />
  }
];

export default AnimatedTabs;