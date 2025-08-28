# AI Assistant Instructions for CRUNEVO

## Project Overview
CRUNEVO is a Next.js-based educational social platform for university students with features like notes sharing, forums, and a virtual economy system using Crolars (virtual currency).

## Architecture & Key Components

### Framework & Stack
- Next.js 13+ with App Router
- TypeScript for type safety
- Prisma ORM with PostgreSQL database
- Authentication via NextAuth.js
- UI components use Radix UI primitives

### Core Application Structure
- `/app/*` - Next.js App Router pages and API routes
- `/components` - Reusable React components, organized by feature
- `/lib` - Core utilities and service integrations
- `/prisma` - Database schema and migrations
- `/src` - Legacy React components (being migrated to /app)

### Key Patterns

#### Authentication & Authorization
- NextAuth.js handles user sessions via `/app/api/auth/[...nextauth]`
- Protected routes should use the auth helper from `/lib/auth.ts`
- Example usage:
```typescript
// Protecting an API route
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })
}
```

#### Database Access
- Use Prisma Client for all database operations
- Database schema in `prisma/schema.prisma` follows a clear domain separation
- Run migrations with `npm run db:migrate`

#### Gamification System
- Gamification events flow through `/services/gamificationService.ts`
- Notifications categorized as `GAMIFICATION` in the notification system
- Points and rewards tracked in user profiles

## Development Workflow

### Getting Started
1. Install dependencies: `npm install`
2. Set up database: 
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push     # Push schema to database
   ```
3. Start development server: `npm run dev`

### Common Tasks
- Database GUI: `npm run db:studio`
- Type checking: `npm run check`
- Linting: `npm run lint`

## Best Practices
- Use the `MainLayout` component from `app/layout.tsx` for consistent navigation
- Follow TypeScript strict mode guidelines
- Organize new features by domain in `/app` directory
- Use Radix UI components for accessible UI elements

## Common Gotchas
- Always regenerate Prisma client after schema changes
- Virtual currency (Crolars) operations must go through gamification service
- Protected routes require session validation
