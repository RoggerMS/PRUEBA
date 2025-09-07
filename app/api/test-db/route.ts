import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL from env:', process.env.DATABASE_URL)
    
    // Test basic connection
    await prisma.$connect()
    console.log('Prisma connected successfully')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Query result:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      result
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}