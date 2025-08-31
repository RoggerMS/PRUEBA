'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/perfil');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

