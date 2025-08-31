'use client';

import { useRouter } from 'next/navigation';
import { NotesUpload } from '@/components/notes/NotesUpload';

export default function NotesUploadPage() {
  const router = useRouter();

  const handleClose = () => router.push('/notes');
  const handleSuccess = () => router.push('/notes');

  return <NotesUpload open={true} onClose={handleClose} onSuccess={handleSuccess} />;
}
