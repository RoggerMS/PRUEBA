'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

interface AnimatedBreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  showBack?: boolean;
  maxItems?: number;
  className?: string;
  onBack?: () => void;
  onHome?: () => void;
  separator?: React.ReactNode;
}

const itemVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const separatorVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 0.5, 
    scale: 1,
    transition: {
      delay: 0.1,
      duration: 0.2
    }
  },
  exit: { opacity: 0, scale: 0 }
};

export function AnimatedBreadcrumb({
  items,
  showHome = true,
  showBack = false,
  maxItems = 4,
  className,
  onBack,
  onHome,
  separator = <ChevronRight className="h-4 w-4" />
}: AnimatedBreadcrumbProps) {
  const [collapsedItems, setCollapsedItems] = React.useState<BreadcrumbItem[]>([]);
  const [visibleItems, setVisibleItems] = React.useState<BreadcrumbItem[]>([]);

  React.useEffect(() => {
    if (items.length <= maxItems) {
      setVisibleItems(items);
      setCollapsedItems([]);
    } else {
      // Show first item, collapsed indicator, and last few items
      const firstItem = items[0];
      const lastItems = items.slice(-(maxItems - 2));
      const collapsed = items.slice(1, -(maxItems - 2));
      
      setVisibleItems([firstItem, ...lastItems]);
      setCollapsedItems(collapsed);
    }
  }, [items, maxItems]);

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {/* Back Button */}
      {showBack && onBack && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Home Button */}
      {showHome && (
        <motion.div
          variants={itemVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onHome}
            className="h-8 px-2 hover:bg-muted"
          >
            <Home className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Separator after home */}
      {showHome && visibleItems.length > 0 && (
        <motion.div
          variants={separatorVariants}
          initial="initial"
          animate="animate"
          className="text-muted-foreground"
        >
          {separator}
        </motion.div>
      )}

      {/* Breadcrumb Items */}
      <div className="flex items-center space-x-2">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;
            const showCollapsed = collapsedItems.length > 0 && index === 1;

            return (
              <React.Fragment key={item.id}>
                {/* Collapsed Items Dropdown */}
                {showCollapsed && (
                  <motion.div
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex items-center space-x-2"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {collapsedItems.map((collapsedItem) => (
                          <DropdownMenuItem
                            key={collapsedItem.id}
                            onClick={() => handleItemClick(collapsedItem)}
                            className="cursor-pointer"
                          >
                            {collapsedItem.icon && (
                              <span className="mr-2">{collapsedItem.icon}</span>
                            )}
                            {collapsedItem.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <motion.div
                      variants={separatorVariants}
                      className="text-muted-foreground"
                    >
                      {separator}
                    </motion.div>
                  </motion.div>
                )}

                {/* Regular Breadcrumb Item */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={!isLast ? "hover" : undefined}
                  className="flex items-center"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleItemClick(item)}
                    disabled={isLast || item.isActive}
                    className={cn(
                      "h-8 px-2 font-medium transition-colors",
                      isLast || item.isActive
                        ? "text-foreground cursor-default hover:bg-transparent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.icon && (
                      <span className="mr-1.5">{item.icon}</span>
                    )}
                    <span className="truncate max-w-[120px]">
                      {item.label}
                    </span>
                  </Button>
                </motion.div>

                {/* Separator */}
                {!isLast && (
                  <motion.div
                    variants={separatorVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="text-muted-foreground"
                  >
                    {separator}
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>
    </nav>
  );
}

// Hook for managing breadcrumb state
export function useBreadcrumb() {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);
  const [history, setHistory] = React.useState<BreadcrumbItem[][]>([]);

  const pushItem = React.useCallback((item: BreadcrumbItem) => {
    setHistory(prev => [...prev, items]);
    setItems(prev => [...prev, item]);
  }, [items]);

  const popItem = React.useCallback(() => {
    if (items.length > 1) {
      setItems(prev => prev.slice(0, -1));
    }
  }, [items]);

  const replaceItem = React.useCallback((index: number, item: BreadcrumbItem) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = item;
      return newItems;
    });
  }, []);

  const navigateToItem = React.useCallback((index: number) => {
    setItems(prev => prev.slice(0, index + 1));
  }, []);

  const reset = React.useCallback((newItems: BreadcrumbItem[] = []) => {
    setItems(newItems);
    setHistory([]);
  }, []);

  const goBack = React.useCallback(() => {
    if (history.length > 0) {
      const previousItems = history[history.length - 1];
      setItems(previousItems);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  return {
    items,
    history,
    pushItem,
    popItem,
    replaceItem,
    navigateToItem,
    reset,
    goBack,
    canGoBack: history.length > 0
  };
}

// Predefined breadcrumb configurations
export const breadcrumbPresets = {
  profile: {
    showHome: true,
    showBack: false,
    maxItems: 4,
    separator: <ChevronRight className="h-4 w-4" />
  },
  settings: {
    showHome: true,
    showBack: true,
    maxItems: 3,
    separator: <ChevronRight className="h-4 w-4" />
  },
  modal: {
    showHome: false,
    showBack: true,
    maxItems: 2,
    separator: <ChevronRight className="h-4 w-4" />
  }
};

// Common breadcrumb items
export const commonBreadcrumbItems = {
  home: {
    id: 'home',
    label: 'Inicio',
    icon: <Home className="h-4 w-4" />
  },
  profile: {
    id: 'profile',
    label: 'Perfil'
  },
  edit: {
    id: 'edit',
    label: 'Editar'
  },
  settings: {
    id: 'settings',
    label: 'Configuración'
  },
  social: {
    id: 'social',
    label: 'Social'
  },
  achievements: {
    id: 'achievements',
    label: 'Logros'
  },
  activity: {
    id: 'activity',
    label: 'Actividad'
  }
};

export default AnimatedBreadcrumb;