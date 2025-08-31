'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { SocialProfile, User } from '@/src/components/perfil/SocialProfile'
import { Loader2 } from 'lucide-react'

export default function PerfilPage() {
  const { status } = useSession()
  const [profile, setProfile] = useState<User | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const { user } = await res.json()
          setProfile({
            id: user.id,
            name: user.name || '',
            username: user.username || '',
            avatar: user.image || '',
            banner: '',
            bio: '',
            location: '',
            university: user.university || '',
            major: user.career || '',
            joinDate: user.createdAt,
            level: user.level || 1,
            xp: user.xp || 0,
            maxXp: user.xp || 0,
            interests: [],
            followers: 0,
            following: 0,
            posts: user.stats?.posts || 0
          })
        }
      } catch (error) {
        console.error('Error loading profile', error)
      }
    }

    loadProfile()
  }, [status])

  if (status === 'loading' || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <SocialProfile user={profile} isOwnProfile />
}

