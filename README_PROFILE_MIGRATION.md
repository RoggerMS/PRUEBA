# Profile Route Migration

This update migrates user profile editing to the unified routes `/[username]` and `/[username]/edit`, removing the old `/perfil` path entirely.

## Manual Checks

- GET `/RoGgEr` redirects to `/rogger` when the canonical username is lowercased.
- Visiting `/usuarioB/edit` as a different user redirects to `/usuarioB`.
- Public view `/[username]` shows no editing controls and no **Configuración** button.
- Edit view `/[username]/edit` shows editing controls and a button to view the public profile.

These checks were run manually after implementation.
