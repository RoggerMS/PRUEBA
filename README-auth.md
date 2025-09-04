# Autenticación y rutas

Este proyecto utiliza **NextAuth** y middleware para proteger rutas. Las rutas públicas pueden visitarse sin iniciar sesión; las protegidas redirigen a `/auth/login` (también accesible como `/auth/signin`). Los correos electrónicos se normalizan a minúsculas en el registro y al iniciar sesión para evitar problemas de identificación.

## Rutas públicas

- `/`
- `/auth/*`
- `/[username]`
- `/post/[id]`
- `/notes/[id]`
- `/feed/public`
- Páginas informativas: `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/help`

## Rutas protegidas

- `/feed`
- `/perfil` - perfil del usuario con edición inline coherente con `/settings`
- `/workspace`
- `/settings`
- Otras secciones con acciones de usuario (`/notifications`, `/bookmarks`, `clubs/*`, etc.)

## Desarrollo vs producción

En desarrollo puede activarse una sesión simulada con `DEV_MOCK_SESSION=true` para navegar sin autenticación real. En producción siempre se requiere una sesión válida.

## Verificación

Ejecuta `npm run check-auth` con el servidor en marcha. El script verifica accesos públicos, redirecciones y que la API solo exponga contenido `PUBLIC` cuando no hay sesión.
