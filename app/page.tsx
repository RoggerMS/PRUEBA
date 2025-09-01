import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FacebookStyleComposer } from '@/components/feed/FacebookStyleComposer';
import PostList from '@/components/feed/PostList';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { TrendingSidebar } from '@/components/feed/TrendingSidebar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton components para loading states
function ComposerSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex space-x-4 pt-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // Si no hay sesión, redirigir al login
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar izquierdo - Navegación y perfil */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <Suspense fallback={<SidebarSkeleton />}>
                <FeedSidebar />
              </Suspense>
            </div>
          </div>

          {/* Contenido principal - Feed */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Composer para crear posts */}
              <Suspense fallback={<ComposerSkeleton />}>
          <FacebookStyleComposer />
              </Suspense>

              {/* Lista de posts del feed */}
              <Suspense fallback={<PostListSkeleton />}>
                <PostList />
              </Suspense>
            </div>
          </div>

          {/* Sidebar derecho - Trending y recomendaciones */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <Suspense fallback={<SidebarSkeleton />}>
                <TrendingSidebar />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

