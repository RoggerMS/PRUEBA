import { NextResponse } from 'next/server';

export async function GET() {
  const topics = [
    { name: 'nextjs', count: 120 },
    { name: 'prisma', count: 90 },
    { name: 'typescript', count: 75 },
    { name: 'javascript', count: 65 },
  ];
  return NextResponse.json(topics);
}
