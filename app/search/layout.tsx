import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Búsqueda - CRUNEVO',
  description: 'Busca usuarios, publicaciones y conversaciones en CRUNEVO'
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}