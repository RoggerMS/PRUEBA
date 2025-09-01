'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { FacebookStyleComposer } from '@/components/feed/FacebookStyleComposer';
import PostList from '@/components/feed/PostList';
import WeeklyChallengeInline from '@/components/feed/WeeklyChallengeInline';
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
    <main className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Timeline */}
          <section className="lg:col-span-8 space-y-4">
            {session && (
              <Suspense fallback={<ComposerSkeleton />}>
                <Composer />
              </Suspense>
            )}
            <WeeklyChallengeInline />
            <Suspense fallback={<PostListSkeleton />}>
              <PostList />
            </Suspense>
          </section>

          {/* Sidebar derecha */}
          <aside className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="space-y-4 sticky top-6">

              <Suspense fallback={<SidebarSkeleton />}>
                <TrendingSidebar />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
