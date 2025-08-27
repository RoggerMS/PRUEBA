'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Composer } from '@/components/feed/Composer';
import { PostList } from '@/components/feed/PostList';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { TrendingSidebar } from '@/components/feed/TrendingSidebar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading components
function ComposerSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-20 w-full mb-4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </Card>
  );
}

function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full mb-4" />
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation & Quick Actions */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <Suspense fallback={<SidebarSkeleton />}>
                <FeedSidebar />
              </Suspense>
            </div>
          </div>

          {/* Main Feed Content */}
          <div className="col-span-1 lg:col-span-6">
            <div className="space-y-6">
              {/* Composer (solo si está autenticado) */}
              {session && (
                <Suspense fallback={<ComposerSkeleton />}>
                  <Composer />
                </Suspense>
              )}

              {/* Post List */}
              <Suspense fallback={<PostListSkeleton />}>
                <PostList />
              </Suspense>
            </div>
          </div>

          {/* Right Sidebar - Suggestions & Trending */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <Suspense fallback={<SidebarSkeleton />}>
                <TrendingSidebar />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
