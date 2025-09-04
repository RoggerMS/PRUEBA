import { prisma } from '@/lib/prisma';

export const RESERVED_USERNAMES = ['api', 'u', 'auth', 'tienda', 'eventos'];

export async function getUserByUsername(username: string) {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      image: true,
    },
  });
  return user;
}

export function isReservedUsername(username: string) {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
}
