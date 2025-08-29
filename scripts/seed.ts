import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@local.test';
  const password = 'admin1234';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username: 'admin',
      name: 'Admin Local',
      password: hash,
      emailVerified: new Date(),
      crolars: 2450, level: 1, xp: 0, streak: 0
    },
    select: { id: true }
  });

  const board = await prisma.workspaceBoard.upsert({
    where: { id: 'default-board-admin' },
    update: {},
    create: {
      id: 'default-board-admin',
      userId: user.id,
      name: 'Pizarra 1',
      isDefault: true
    },
    select: { id: true }
  });

  await prisma.workspaceBlock.create({
    data: {
      boardId: board.id,
      type: 'DOCS',
      title: 'Bienvenido 👋',
      x: 60, y: 60, w: 360, h: 240, zIndex: 1
    }
  });

  console.log('✅ Seed listo. Usuario:', email, 'pass:', password);
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
