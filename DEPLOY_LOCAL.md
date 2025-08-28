# Deploy Local de Producción

## Guía Completa para Deploy Local

### 📋 Prerrequisitos
- Node.js 22.17.1 o superior
- npm instalado
- Base de datos SQLite (incluida en el proyecto)

### 🚀 Pasos para Deploy Local

#### 1. Preparar el Entorno
```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npm run db:generate
```

#### 2. Configurar Variables de Entorno
El archivo `.env.local` ya está configurado con:
- `NODE_ENV=production`
- `DATABASE_URL` para SQLite local
- `NEXTAUTH_URL` y `NEXTAUTH_SECRET` para autenticación
- Configuración de Redis (opcional)
- Optimizaciones de producción

#### 3. Crear Build de Producción
```bash
# Crear build optimizado
npm run build
```

#### 4. Ejecutar en Modo Producción
```bash
# Iniciar servidor de producción
npm start
```

### 🌐 Acceso a la Aplicación
- **URL Principal**: http://localhost:3000
- **Workspace**: http://localhost:3000/workspace
- **API Endpoints**: http://localhost:3000/api/*

### 📁 Estructura de APIs Disponibles

#### Workspace APIs
- `GET/POST /api/workspace/boards` - Gestión de tableros
- `GET/POST/PATCH/DELETE /api/workspace/blocks` - Gestión de bloques
- `GET/POST /api/workspace/docs/pages` - Páginas de documentos
- `GET/POST /api/workspace/kanban/columns` - Columnas de Kanban
- `GET/POST /api/workspace/kanban/cards` - Tarjetas de Kanban
- `GET/POST /api/workspace/frases/items` - Items de frases

#### Feed APIs
- `GET/POST /api/feed` - Feed de publicaciones
- `GET/POST /api/feed/[id]/comments` - Comentarios

#### Auth APIs
- `/api/auth/*` - Autenticación con NextAuth

### 🔧 Comandos Útiles

```bash
# Verificar tipos TypeScript
npm run check

# Ejecutar linting
npm run lint

# Gestión de base de datos
npm run db:studio    # Abrir Prisma Studio
npm run db:push      # Sincronizar esquema
npm run db:migrate   # Ejecutar migraciones
```

### 🐛 Solución de Problemas

#### Si el servidor no inicia:
1. Verificar que el puerto 3000 esté libre
2. Revisar que todas las dependencias estén instaladas
3. Comprobar que el build se haya completado correctamente

#### Si hay errores de base de datos:
1. Ejecutar `npm run db:generate`
2. Verificar que el archivo `prisma/dev.db` exista
3. Ejecutar `npm run db:push` si es necesario

#### Si hay errores de autenticación:
1. Verificar que `NEXTAUTH_SECRET` esté configurado
2. Comprobar que `NEXTAUTH_URL` apunte a localhost:3000

### 📊 Optimizaciones Incluidas
- Build optimizado con tree-shaking
- Compresión de assets
- Lazy loading de componentes
- Telemetría de Next.js deshabilitada
- Source maps deshabilitados para producción

### 🔒 Seguridad
- Variables de entorno separadas para producción
- Autenticación con NextAuth configurada
- CORS configurado para desarrollo local
- Validación de esquemas con Zod

---

**✅ Deploy Local Completado**

La aplicación está lista para funcionar en modo producción local con todas las funcionalidades del workspace operativas.