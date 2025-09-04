'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProfileSkeletonProps {
  variant?: 'full' | 'header' | 'card' | 'list' | 'feed';
  className?: string;
  animated?: boolean;
}

const shimmerVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

// Full Profile Skeleton
function FullProfileSkeleton({ animated = true, className }: { animated?: boolean; className?: string }) {
  const MotionDiv = animated ? motion.div : 'div';
  const motionProps = animated ? {
    variants: staggerContainer,
    initial: "initial",
    animate: "animate"
  } : {};

  return (
    <MotionDiv className={cn("space-y-6", className)} {...motionProps}>
      {/* Cover Image */}
      <motion.div variants={animated ? slideUp : undefined}>
        <Skeleton className="w-full h-48 rounded-lg" />
      </motion.div>

      {/* Profile Header */}
      <motion.div variants={animated ? slideUp : undefined} className="relative">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Skeleton className="w-24 h-24 rounded-full" />
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={animated ? slideUp : undefined}>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div variants={animated ? slideUp : undefined} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <div className="flex gap-4 mt-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MotionDiv>
  );
}

// Profile Header Skeleton
function ProfileHeaderSkeleton({ animated = true, className }: { animated?: boolean; className?: string }) {
  const MotionDiv = animated ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={cn("space-y-4", className)}
      variants={animated ? staggerContainer : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
    >
      <motion.div variants={animated ? slideUp : undefined}>
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </motion.div>
    </MotionDiv>
  );
}

// Profile Card Skeleton
function ProfileCardSkeleton({ animated = true, className }: { animated?: boolean; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <motion.div 
          className="space-y-3"
          variants={animated ? staggerContainer : undefined}
          initial={animated ? "initial" : undefined}
          animate={animated ? "animate" : undefined}
        >
          <motion.div variants={animated ? slideUp : undefined} className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </motion.div>
          
          <motion.div variants={animated ? slideUp : undefined} className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </motion.div>
          
          <motion.div variants={animated ? slideUp : undefined} className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Profile List Skeleton
function ProfileListSkeleton({ animated = true, className, count = 5 }: { animated?: boolean; className?: string; count?: number }) {
  const MotionDiv = animated ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={cn("space-y-3", className)}
      variants={animated ? staggerContainer : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={animated ? slideUp : undefined}>
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </motion.div>
      ))}
    </MotionDiv>
  );
}

// Profile Feed Skeleton
function ProfileFeedSkeleton({ animated = true, className, count = 3 }: { animated?: boolean; className?: string; count?: number }) {
  const MotionDiv = animated ? motion.div : 'div';
  
  return (
    <MotionDiv 
      className={cn("space-y-4", className)}
      variants={animated ? staggerContainer : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={animated ? slideUp : undefined}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-8 h-8" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                
                {i % 2 === 0 && (
                  <Skeleton className="w-full h-48 rounded-lg" />
                )}
                
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </MotionDiv>
  );
}

export function ProfileSkeleton({ variant = 'full', className, animated = true }: ProfileSkeletonProps) {
  const skeletonProps = { animated, className };
  
  switch (variant) {
    case 'header':
      return <ProfileHeaderSkeleton {...skeletonProps} />;
    case 'card':
      return <ProfileCardSkeleton {...skeletonProps} />;
    case 'list':
      return <ProfileListSkeleton {...skeletonProps} />;
    case 'feed':
      return <ProfileFeedSkeleton {...skeletonProps} />;
    case 'full':
    default:
      return <FullProfileSkeleton {...skeletonProps} />;
  }
}

// Shimmer effect component
export function ShimmerSkeleton({ className, animated = true }: { className?: string; animated?: boolean }) {
  const MotionDiv = animated ? motion.div : 'div';
  const motionProps = animated ? {
    variants: shimmerVariants,
    initial: "initial",
    animate: "animate"
  } : {};
  
  return (
    <MotionDiv 
      className={cn("bg-muted rounded animate-pulse", className)}
      {...motionProps}
    />
  );
}

export default ProfileSkeleton;