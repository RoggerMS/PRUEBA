# Changelog

## [Unreleased]

- Move Cantuta university data to root data/ directory so `npm run build` succeeds.
- Fix TypeScript build errors across project.
- Redirect `/auth/signin` to `/auth/login` and update authentication routes.
- Resolve component import mismatches and add API rate limiting helpers.
- Correct Feed import in App.tsx to use named export.
- Fix NotificationCenter and gamification component imports to prevent invalid element type errors.
- Replace NotificationCenter context usage with dedicated hook to avoid runtime type errors.
- Move notification stream helpers to `src/lib/notificationStream.ts`.
- Remove unsupported fields from auth registration and welcome transaction.
- Align gamification leaderboard and achievement data with defined types.
- Guard optional marketplace product properties to avoid undefined access.
- Provide complete mock data for clubs, competitions, and marketplace pages and remove unsupported `useSearchParams` usage so `npm run build` succeeds.
- Categorize gamification notifications correctly to allow local builds.
- Add Feed page and navigation link in sidebar.
- Correct footer links for Cookies, Privacy, Terms, and Support pages.
- Allow unauthenticated users to view public posts via the feed API.
- Resolve feed API route type mismatches and enum casing errors.
- Skip notification stream setup when unauthenticated to eliminate 401 errors.
- Gracefully return an empty feed when the database is unavailable.
- Show mock feed posts and composer in development when the feed service is offline.
- Render home page content instead of a blank screen and replace Next.js links with React Router links.
- Fix missing Feed route and update feed component links to use React Router so the social network is displayed correctly.
- Stub authentication routes and add a session endpoint to avoid 404 errors during development.
- Rename "Espacio Personal" navigation item to "Workspace" and fix related links.
- Wrap root layout with SessionProvider and improve workspace board loading to prevent endless "Cargando..." state.
- Move SessionProvider into client Providers and add development session fallback so workspace loads without RSC errors.
- Fetch profile feed posts from API, fix AchievementCard import, and enable publishing from user profiles.
- Centralize route protection with middleware, isolate auth layout, and add automated checks for public/private access.
- Replace default "U" avatar with generic user icon and direct unauthenticated profile clicks to login.
- Guard missing profile fields and handle empty interests to prevent runtime errors on the profile page.
- Restore inline profile editing on `/perfil` without redirecting to settings.
- Replace example profile page with API-driven version and align editor with `/settings`.
- Remove quick configuration card from profile page and centralize settings under `/settings`.
- Reintroduce achievements tab and dedicated pages at `/perfil/logros` and `/u/[username]/logros`.
- Correct camera icon alignment on profile avatar and banner.
- Replace missing Fire icon with FlameIcon and use proper NotificationToast import to resolve development runtime errors.

- **FIXED: Notification Service Errors**
  - Added missing `connect()`, `disconnect()`, and `requestNotificationPermission()` methods to `notificationService.ts`
  - Fixed TypeError: "notificationService.connect is not a function" in MainLayout
  - Migrated from WebSocket to Server-Sent Events (SSE) for real-time notifications due to Next.js compatibility
  - Updated `useWebSocketNotifications.ts` to use EventSource API instead of WebSocket
  - Updated `useNotifications.ts` to use SSE for real-time notification streaming
  - Fixed "Network error" issues by switching to `/api/notifications/stream` SSE endpoint
  - Improved error handling and reconnection logic for SSE connections
  - Enhanced notification service with user ID tracking and connection status management
  - Added browser notification permission handling and display functionality

