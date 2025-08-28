# Changelog

## [Unreleased]

- Fix TypeScript build errors across project.
- Correct Feed import in App.tsx to use named export.
- Move notification stream helpers to `src/lib/notificationStream.ts`.
- Remove unsupported fields from auth registration and welcome transaction.
- Align gamification leaderboard and achievement data with defined types.
- Guard optional marketplace product properties to avoid undefined access.
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

