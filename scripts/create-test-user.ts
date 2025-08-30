import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.TEST_USER_EMAIL || 'qa.tester@crunevo.test'
  const username = process.env.TEST_USER_USERNAME || 'qa_tester'
  const name = process.env.TEST_USER_NAME || 'QA Tester'
  const plainPassword = process.env.TEST_USER_PASSWORD || 'Crunevo123!'

  const hashed = await bcrypt.hash(plainPassword, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      username,
      name,
      password: hashed,
      emailVerified: new Date(),
    },
    create: {
      email,
      username,
      name,
      password: hashed,
      emailVerified: new Date(),
      crolars: 1000,
      level: 1,
      xp: 0,
      streak: 0,
      lastActivity: new Date(),
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
    }
  })

  console.log('Test user ready:', user)
  console.log('\nCredentials to sign in:')
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${plainPassword}`)
}

main()
  .catch((e) => {
    console.error('Error creating test user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

