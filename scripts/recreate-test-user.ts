import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.TEST_USER_EMAIL || 'qa.tester@crunevo.test'
  const username = process.env.TEST_USER_USERNAME || 'qa_tester'
  const name = process.env.TEST_USER_NAME || 'QA Tester'
  const plainPassword = process.env.TEST_USER_PASSWORD || 'Crunevo123!'

  console.log(`Eliminando usuario existente: ${email}`)
  
  // Primero eliminar el usuario si existe
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    })
    
    if (existingUser) {
      // Eliminar relaciones dependientes primero
      await prisma.clubMember.deleteMany({
        where: { userId: existingUser.id }
      })
      
      await prisma.clubPost.deleteMany({
        where: { authorId: existingUser.id }
      })
      
      await prisma.eventAttendance.deleteMany({
        where: { userId: existingUser.id }
      })
      
      await prisma.transaction.deleteMany({
        where: { userId: existingUser.id }
      })
      
      await prisma.streakClaim.deleteMany({
        where: { userId: existingUser.id }
      })
      
      await prisma.referral.deleteMany({
        where: { 
          OR: [
            { referrerId: existingUser.id },
            { referredId: existingUser.id }
          ]
        }
      })
      
      await prisma.account.deleteMany({
        where: { userId: existingUser.id }
      })
      
      await prisma.session.deleteMany({
        where: { userId: existingUser.id }
      })
      
      // Finalmente eliminar el usuario
      await prisma.user.delete({
        where: { id: existingUser.id }
      })
      
      console.log(`Usuario ${email} eliminado exitosamente`)
    } else {
      console.log(`Usuario ${email} no existe`)
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error)
  }

  console.log(`Creando nuevo usuario: ${email}`)
  
  const hashed = await bcrypt.hash(plainPassword, 12)

  const user = await prisma.user.create({
    data: {
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

  console.log('Nuevo usuario creado:', user)
  console.log('\nCredenciales para iniciar sesión:')
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${plainPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })