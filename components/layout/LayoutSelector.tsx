'use client'

import { usePathname } from 'next/navigation'
import { MainLayout } from './MainLayout'

interface Props {
  children: React.ReactNode
}

export function LayoutSelector({ children }: Props) {
  const pathname = usePathname()
  const isAuthRoute = pathname.startsWith('/auth')
  return isAuthRoute ? <>{children}</> : <MainLayout>{children}</MainLayout>
}

export default LayoutSelector
