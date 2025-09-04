import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfiles de Usuario - CRUNEVO',
  description: 'Perfiles de usuarios en CRUNEVO'
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}