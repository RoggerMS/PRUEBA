# Changelog

## [Unreleased]

- Fix TypeScript build errors across project.
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

