# Desarrollo local

## Variables de entorno necesarias

Crea un archivo `.env.local` con:

```
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
NEXTAUTH_SECRET=some-long-random-string
DATABASE_URL="file:./prisma/dev.db"
```

## Pasos

1. Instalar dependencias:
   ```bash
   npm ci
   ```
2. Sincronizar base de datos:
   ```bash
   npx prisma db push
   ```
3. Poblar datos de ejemplo (opcional):
   ```bash
   npm run db:seed
   ```
4. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Endpoints útiles

- `GET /api/health`
- `GET /api/auth/session`
- `GET /api/workspace/debug`
- `GET /api/workspace/boards`

En desarrollo, si no hay sesión activa, las rutas de `workspace` utilizan el primer usuario de la base de datos como sesión simulada.
