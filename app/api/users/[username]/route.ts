import { NextRequest, NextResponse } from 'next/server'

// Mock user data - In production, this would come from Supabase
const mockUsers = [
  {
    id: 'user_123',
    username: 'johndoe',
    displayName: 'John Doe',
    bio: 'Estudiante de Ingeniería de Sistemas apasionado por la tecnología',
    avatarUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20engineering&image_size=square',
    bannerUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=university%20campus%20banner%20blue%20purple%20gradient&image_size=landscape_16_9',
    location: 'Lima, Perú',
    university: 'Universidad Nacional de Educación Enrique Guzmán y Valle',
    major: 'Ingeniería de Sistemas',
    interests: ['Programación', 'IA', 'Videojuegos'],
    joinDate: '2024-01-15T00:00:00Z',
    isPublic: true,
    followers: 150,
    following: 89,
    posts: 42
  },
  {
    id: 'user_456',
    username: 'mariagarcia',
    displayName: 'María García',
    bio: 'Desarrolladora Full Stack con experiencia en React y Node.js',
    avatarUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20developer&image_size=square',
    bannerUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=coding%20workspace%20banner%20purple%20blue%20gradient&image_size=landscape_16_9',
    location: 'Arequipa, Perú',
    university: 'Universidad Nacional de Educación Enrique Guzmán y Valle',
    major: 'Ingeniería Informática',
    interests: ['React', 'Node.js', 'UI/UX'],
    joinDate: '2024-02-20T00:00:00Z',
    isPublic: true,
    followers: 203,
    following: 156,
    posts: 67
  }
]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  try {

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // In production, this would query Supabase:
    // const { data: user, error } = await supabase
    //   .from('profiles')
    //   .select(`
    //     id,
    //     user_id,
    //     display_name,
    //     bio,
    //     avatar_url,
    //     banner_url,
    //     location,
    //     university,
    //     major,
    //     interests,
    //     is_public,
    //     created_at,
    //     users!inner(username)
    //   `)
    //   .eq('users.username', username)
    //   .eq('is_public', true)
    //   .single()

    // Mock implementation
    const user = mockUsers.find(u => u.username === username)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isPublic) {
      return NextResponse.json(
        { error: 'Profile is private' },
        { status: 403 }
      )
    }

    // Transform data to match API specification
    const publicProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      location: user.location,
      university: user.university,
      major: user.major,
      interests: user.interests,
      joinDate: user.joinDate,
      isPublic: user.isPublic,
      followers: user.followers,
      following: user.following,
      posts: user.posts
    }

    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}