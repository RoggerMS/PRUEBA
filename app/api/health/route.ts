import { NextResponse } from 'next/server';

// GET /api/health - Health check endpoint for Docker
export async function GET() {
  try {
    // You can add additional health checks here if needed
    // For example: database connection, external services, etc.
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed'
    }, { status: 503 });
  }
}