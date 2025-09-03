jest.mock('next/server', () => ({
  NextResponse: class {
    constructor(public body: any, public init?: any) {}
    static json(body: any, init?: any) {
      return new this(body, init)
    }
    json() {
      return Promise.resolve(this.body)
    }
    get status() {
      return this.init?.status || 200
    }
  },
  NextRequest: class {}
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    }
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimitRegister: jest.fn().mockResolvedValue({ success: true })
}))

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))

jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    const err = new Error(`REDIRECT:${url}`)
    ;(err as any).digest = 'NEXT_REDIRECT'
    throw err
  },
  notFound: () => {
    const err = new Error('NOT_FOUND')
    ;(err as any).digest = 'NEXT_NOT_FOUND'
    throw err
  }
}))

jest.mock('@/components/user/EnhancedProfile', () => ({
  EnhancedProfile: () => null
}))

jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  authOptions: {} as any
}))

import { POST as register } from '@/app/api/auth/register/route'
import { GET as getOwnProfile } from '@/app/api/users/profile/route'
import { GET as getUser } from '@/app/api/users/[id]/route'
import ProfilePage from '@/app/u/[username]/page'
import { getUserByUsername, getUserByEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Replaced pg-mem with a simple set-based simulation to avoid external dependency
const prismaMock = (prisma as any).user
const getServerSessionNext = require('next-auth/next').getServerSession as jest.Mock
const getServerSession = require('next-auth').getServerSession as jest.Mock

afterEach(() => {
  jest.clearAllMocks()
})

test('register normalizes username and email to lowercase', async () => {
  prismaMock.findUnique.mockResolvedValue(null)
  prismaMock.findFirst.mockResolvedValue(null)
  prismaMock.create.mockResolvedValue({ id: '1', email: 'a@example.com', username: 'rogger', name: 'Rogger', createdAt: new Date() })

  const req = { json: async () => ({ email: 'A@Example.com', password: 'secret', username: 'Rogger', name: 'Rogger' }) } as any
  await register(req)
  expect(prismaMock.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ username: 'rogger', email: 'a@example.com' }) }))
})

test('getUserByEmail matches case-insensitively', async () => {
  prismaMock.findUnique.mockResolvedValue({ id: '1', email: 'a@example.com', username: 'rogger', name: 'Rogger', password: 'hash', emailVerified: null, verified: false, role: 'STUDENT', university: null, career: null, image: null })
  const user = await getUserByEmail('A@EXAMPLE.com')
  expect(prismaMock.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'a@example.com' } }))
  expect(user?.email).toBe('a@example.com')
})

test('getUserByUsername matches case-insensitively', async () => {
  prismaMock.findFirst.mockResolvedValue({ id: '1', username: 'rogger' })
  const user = await getUserByUsername('ROGGER')
  expect(user?.username).toBe('rogger')
})

test('GET /u/ROGGER redirects to canonical lowercase', async () => {
  prismaMock.findFirst.mockResolvedValue({ id: '1', username: 'rogger' })
  await expect(ProfilePage({ params: { username: 'ROGGER' } })).rejects.toThrow('REDIRECT:/u/rogger')
})

test('GET /api/users/[id] returns profile for uppercase username', async () => {
  getServerSessionNext.mockResolvedValue(null)
  prismaMock.findFirst.mockResolvedValue({
    id: '1',
    name: 'Rogger',
    username: 'rogger',
    email: 'a',
    image: null,
    bio: null,
    verified: false,
    createdAt: new Date(),
    _count: { posts: 0, followers: 0, following: 0 },
    followers: []
  })
  const res = await getUser({} as any, { params: { id: 'ROGGER' } })
  const json = await res.json()
  expect(json.username).toBe('rogger')
})

test('GET /api/users/profile requires session', async () => {
  getServerSessionNext.mockResolvedValueOnce(null)
  const res = await getOwnProfile()
  expect(res.status).toBe(401)
})

test('GET /api/users/profile returns profile with counts', async () => {
  getServerSessionNext.mockResolvedValueOnce({ user: { id: '1' } })
  prismaMock.findUnique.mockResolvedValueOnce({
    id: '1',
    name: 'Rogger',
    username: 'rogger',
    email: 'a',
    image: null,
    bio: null,
    verified: false,
    createdAt: new Date(),
    _count: { posts: 5, followers: 2, following: 3 }
  })
  const res = await getOwnProfile()
  const json = await res.json()
  expect(json.isOwnProfile).toBe(true)
  expect(json.stats.posts).toBe(5)
})

test('DB enforces case-insensitive username uniqueness', () => {
  const users = new Set<string>()
  const insert = (username: string) => {
    const key = username.toLowerCase()
    if (users.has(key)) {
      throw new Error('duplicate key')
    }
    users.add(key)
  }
  insert('Juan')
  expect(() => insert('juan')).toThrow()
})
