# Documento de Requisitos del Producto - Sistema de Autenticación CRUNEVO

## 1. Resumen del Producto

Implementación de un sistema de autenticación completo tipo red social para CRUNEVO, que permita registro, login, gestión de perfiles públicos y control de visibilidad de contenido. El sistema debe proteger rutas sensibles mientras mantiene acceso público a perfiles y contenido marcado como público, creando una experiencia fluida tanto para usuarios autenticados como visitantes anónimos.

## 2. Características Principales

### 2.1 Roles de Usuario

| Rol                | Método de Registro                | Permisos Principales                                                |
| ------------------ | --------------------------------- | ------------------------------------------------------------------- |
| Visitante Anónimo  | No requiere registro              | Puede ver perfiles públicos, posts públicos, páginas informativas   |
| Usuario Registrado | Email + contraseña o Google OAuth | Acceso completo al feed, workspace, settings, puede crear contenido |
| Administrador      | Promoción manual                  | Gestión de usuarios, moderación de contenido, acceso a métricas     |

### 2.2 Módulos de Funcionalidad

Nuestro sistema de autenticación consta de las siguientes páginas principales:

1. **Páginas de Autenticación**: formularios de login, registro, recuperación de contraseña y reset.
2. **Perfiles Públicos**: vista de solo lectura de perfiles de usuario con información básica y posts públicos.
3. **Páginas Protegidas**: feed, workspace, settings, notifications, messages que requieren autenticación.
4. **Middleware de Protección**: sistema automático de redirección y control de acceso.

### 2.3 Detalles de Páginas

| Página                  | Módulo                   | Descripción de Funcionalidad                                                                               |
| ----------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `/auth/login`           | Formulario de Login      | Autenticación con email/username + contraseña, enlace a registro y recuperación, validación en tiempo real |
| `/auth/register`        | Formulario de Registro   | Crear cuenta con email único, username único, validación de contraseña fuerte, términos y condiciones      |
| `/auth/forgot-password` | Recuperación             | Solicitar reset por email, validación de email existente, envío de token temporal                          |
| `/auth/reset-password`  | Reset de Contraseña      | Formulario con token de validación, nueva contraseña con confirmación, expiración de token                 |
| `/u/[username]`         | Perfil Público           | Mostrar avatar, banner, bio, estadísticas, posts públicos, información académica, sin botones de edición   |
| `/post/[id]`            | Post Público             | Visualizar post individual si es público, comentarios públicos, información del autor, compartir           |
| `/notes/[id]`           | Nota Pública             | Mostrar nota individual si es pública, metadatos, autor, sin opciones de edición                           |
| `/feed`                 | Feed Protegido           | Timeline personalizado, composer, reacciones, comentarios, filtros, solo usuarios autenticados             |
| `/workspace`            | Espacio de Trabajo       | Herramientas de productividad, proyectos, colaboración, requiere sesión activa                             |
| `/settings`             | Configuraciones          | Pestañas de perfil, cuenta, privacidad, notificaciones, cambio de contraseña, gestión de sesiones          |
| `/notifications`        | Centro de Notificaciones | Lista de notificaciones, marcar como leído, configuraciones, solo usuarios logueados                       |
| `/messages`             | Sistema de Mensajería    | Chat privado, conversaciones, envío de mensajes, requiere autenticación                                    |
| `/composer`             | Crear Contenido          | Editor de posts/notas, selección de visibilidad, adjuntos, programación, solo autenticados                 |

## 3. Proceso Principal

### Flujo de Usuario Anónimo

Los visitantes pueden acceder libremente a la página principal, perfiles públicos (/u/username), posts públicos (/post/id), y páginas informativas. Al intentar acceder a rutas protegidas como /feed o /settings, son redirigidos automáticamente a /auth/login.

### Flujo de Registro y Autenticación

Nuevos usuarios se registran en /auth/register con email, username y contraseña. Después del registro exitoso, son redirigidos al feed. Usuarios existentes inician sesión en /auth/login y son llevados a su destino original o al feed por defecto.

### Flujo de Recuperación de Contraseña

Usuarios que olvidan su contraseña van a /auth/forgot-password, ingresan su email, reciben un token (por consola en desarrollo, por email en producción), y usan /auth/reset-password para establecer nueva contraseña.

### Flujo de Usuario Autenticado

Usuarios logueados tienen acceso completo a todas las funcionalidades: pueden ver su feed personalizado, crear contenido con diferentes niveles de visibilidad, gestionar su perfil en settings, y acceder a herramientas del workspace.

```mermaid
graph TD
    A[Página Principal] --> B{¿Usuario Logueado?}
    B -->|No| C[Vista Pública]
    B -->|Sí| D[Feed Personalizado]
    
    C --> E[/u/username - Perfil Público]
    C --> F[/post/id - Post Público]
    C --> G[/auth/login - Iniciar Sesión]
    C --> H[/auth/register - Registrarse]
    
    G --> I{¿Credenciales Válidas?}
    I -->|Sí| D
    I -->|No| J[Error de Login]
    
    H --> K{¿Datos Válidos?}
    K -->|Sí| L[Registro Exitoso]
    K -->|No| M[Error de Registro]
    
    L --> D
    
    D --> N[/settings - Configuraciones]
    D --> O[/workspace - Herramientas]
    D --> P[/composer - Crear Contenido]
    D --> Q[/notifications - Notificaciones]
    D --> R[/messages - Mensajes]
    
    G --> S[/auth/forgot-password]
    S --> T[/auth/reset-password]
    T --> G
```

## 4. Diseño de Interfaz de Usuario

### 4.1 Estilo de Diseño

* **Colores Primarios**: Azul universitario (#1e40af), Verde académico (#059669)

* **Colores Secundarios**: Gris neutro (#6b7280), Blanco (#ffffff), Negro suave (#1f2937)

* **Estilo de Botones**: Redondeados (rounded-lg), con efectos hover y estados de carga

* **Tipografía**: Inter como fuente principal, tamaños 14px (texto), 16px (botones), 24px (títulos)

* **Layout**: Diseño centrado con máximo 400px para formularios, cards con sombras suaves

* **Iconos**: Lucide React para consistencia, tamaño 20px por defecto

### 4.2 Resumen de Diseño por Página

| Página                  | Módulo                 | Elementos de UI                                                                                                                           |
| ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/login`           | Formulario de Login    | Card centrado, campos de email y contraseña con validación visual, botón primario azul, enlaces secundarios, loader durante autenticación |
| `/auth/register`        | Formulario de Registro | Card más alto, campos múltiples con validación en tiempo real, indicador de fuerza de contraseña, checkbox de términos, botón de registro |
| `/auth/forgot-password` | Recuperación           | Card simple, campo de email, texto explicativo, botón de envío, enlace de regreso al login                                                |
| `/auth/reset-password`  | Reset Contraseña       | Card con campos de nueva contraseña y confirmación, validación visual, botón de actualización, mensaje de éxito                           |
| `/u/[username]`         | Perfil Público         | Header con banner y avatar, información personal en grid, estadísticas en cards, lista de posts públicos, sin botones de edición          |
| `/post/[id]`            | Post Individual        | Card principal del post, información del autor, botones de compartir (sin editar), sección de comentarios públicos                        |
| `/feed`                 | Feed Protegido         | Composer en la parte superior, timeline infinito, botones de reacción, modal de comentarios, sidebar con sugerencias                      |
| `/settings`             | Configuraciones        | Navegación por pestañas, formularios organizados por secciones, botones de guardar por módulo, confirmaciones para cambios críticos       |

### 4.3 Responsividad

El sistema está diseñado mobile-first con breakpoints en 640px (sm), 768px (md), y 1024px (lg). Los formularios de autenticación se adaptan de pantalla completa en móvil a cards centrados en desktop. Los perfiles públicos usan layout de columna única en móvil y dos columnas en desktop. Todas las interacciones están optimizadas para touch en dispositivos móviles.

## 5. Requisitos de Seguridad

### 5.1 Autenticación y Autorización

* Contraseñas hasheadas con bcrypt (salt rounds: 12)

* Tokens JWT seguros con expiración de 30 días

* Rate limiting: 5 intentos de login por IP cada 15 minutos

* Validación de fuerza de contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)

* Tokens de reset de contraseña con expiración de 1 hora

### 5.2 Protección de Datos

* Validación de entrada con Zod en todas las APIs

* Sanitización de contenido HTML para prevenir XSS

* Headers de seguridad (CSRF, CORS, Content Security Policy)

* Logs de auditoría para acciones críticas (login, cambio de contraseña)

### 5.3 Control de Visibilidad

* Posts con tres niveles: PUBLIC (todos), FOLLOWERS (seguidores), PRIVATE (solo autor)

* Perfiles con configuración de privacidad (público/privado)

* Middleware que verifica permisos antes de mostrar contenido

* APIs que filtran resultados según el usuario que consulta

## 6. Criterios de Aceptación

### 6.1 Funcionalidad Básica

* ✅ Registro de usuarios con validación de email y username únicos

* ✅ Login con email o username + contraseña

* ✅ Logout que invalida la sesión actual

* ✅ Recuperación de contraseña con token temporal

* ✅ Perfiles públicos accesibles sin autenticación

* ✅ Posts públicos visibles para todos los usuarios

### 6.2 Protección de Rutas

* ✅ Middleware que redirige a /auth/login para rutas protegidas

* ✅ APIs de escritura que requieren sesión válida

* ✅ APIs de lectura que respetan configuraciones de visibilidad

* ✅ Workspace protegido pero funcional para usuarios autenticados

### 6.3 Experiencia de Usuario

* ✅ Formularios con validación en tiempo real

* ✅ Mensajes de error claros y útiles

* ✅ Estados de carga durante operaciones asíncronas

* ✅ Navegación intuitiva entre páginas de autenticación

* ✅ Diseño responsive en todos los dispositivos

### 6.4 Seguridad y Performance

* ✅ Rate limiting en endpoints críticos

* ✅ Validación de entrada en cliente y servidor

* ✅ Tokens seguros con expiración apropiada

* ✅ Logs de auditoría para monitoreo

* ✅ Performance optimizada con SSR para contenido público

## 7. Configuración del Entorno

### 7.1 Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Email (para reset de contraseña en producción)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"

# Desarrollo
DEV_MOCK_SESSION="false"
```

### 7.2 Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:seed": "tsx scripts/seed.ts",
    "db:studio": "prisma studio",
    "check-auth": "node scripts/check-auth.js",
    "test:auth": "npm run check-auth"
  }
}
```

## 8. Plan de Implementación

### Fase 1: Configuración Base (Días 1-2)

* Configurar NextAuth.js con Credentials Provider

* Extender schema de Prisma con campos de autenticación

* Implementar utilidades de hash de contraseñas

* Crear middleware básico de protección

### Fase 2: Páginas de Autenticación (Días 3-4)

* Desarrollar formularios de login y registro

* Implementar validación con Zod

* Crear páginas de recuperación y reset de contraseña

* Añadir manejo de errores y estados de carga

### Fase 3: Sistema de Visibilidad (Días 5-6)

* Extender modelo Post con campo visibility

* Implementar lógica de filtrado en APIs

* Crear perfiles públicos en /u/\[username]

* Desarrollar páginas públicas de posts y notas

### Fase 4: Protección y Seguridad (Días 7-8)

* Implementar rate limiting en APIs críticas

* Añadir logs de auditoría

* Configurar headers de seguridad

* Crear scripts de validación y testing

### Fase 5: Optimización y Documentación (Días 9-10)

* Optimizar performance con SSR/ISR

* Completar documentación técnica

* Realizar testing integral

* Preparar seeds con datos de ejemplo

***

**Entregables Finales:**

* Sistema de autenticación completamente funcional

* Documentación técnica completa (README-auth.md)

* Scripts de validación automatizada (check-auth.js)

* Base de datos con seeds de ejemplo

* Configuración de producción lista para deploy

