# Migración y Mejora del Sistema de Perfiles: De /perfil a /<user>

## 1. Resumen del Proyecto

Migración completa del sistema de perfiles desde las rutas `/perfil` hacia `/<user>` con mejoras significativas en diseño, funcionalidad y experiencia de usuario. El objetivo es consolidar todas las características de perfil, gamificación y logros en una experiencia unificada y moderna.

## 2. Características Principales

### 2.1 Roles de Usuario

| Rol                | Método de Registro                 | Permisos Principales                                       |
| ------------------ | ---------------------------------- | ---------------------------------------------------------- |
| Usuario Registrado | Email + verificación universitaria | Puede ver y editar su propio perfil, ver perfiles públicos |
| Usuario Público    | No registrado                      | Solo puede ver perfiles públicos limitados                 |
| Administrador      | Invitación del sistema             | Gestión completa de perfiles y moderación                  |

### 2.2 Módulos de Funcionalidad

Nuestro sistema de perfiles mejorado consistirá en las siguientes páginas principales:

1. **Perfil Principal**: vista completa del perfil con tabs de navegación, estadísticas de gamificación, información personal.
2. **Editor de Perfil**: formulario completo de edición con vista previa en tiempo real, carga de imágenes.
3. **Logros y Insignias**: galería interactiva de logros, progreso de insignias, sistema de recompensas.
4. **Estadísticas de Gamificación**: dashboard de XP, niveles, rankings, progreso de desafíos.
5. **Feed de Actividad**: publicaciones del usuario, interacciones sociales, historial de actividades.

### 2.3 Detalles de Páginas

| Nombre de Página   | Nombre del Módulo      | Descripción de Funcionalidad                                                               |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------ |
| Perfil Principal   | Header de Perfil       | Mostrar avatar, banner, información básica, botones de acción (seguir, mensaje, compartir) |
| Perfil Principal   | Navegación por Tabs    | Alternar entre Posts, Logros, Estadísticas, Información con animaciones suaves             |
| Perfil Principal   | Estadísticas Rápidas   | Mostrar seguidores, siguiendo, posts, nivel actual, XP                                     |
| Editor de Perfil   | Formulario de Edición  | Editar información personal, bio, enlaces sociales, configuración de privacidad            |
| Editor de Perfil   | Carga de Imágenes      | Subir y recortar avatar y banner con vista previa                                          |
| Editor de Perfil   | Vista Previa           | Mostrar cambios en tiempo real antes de guardar                                            |
| Logros y Insignias | Galería de Logros      | Grid responsivo de logros con filtros por categoría y dificultad                           |
| Logros y Insignias | Progreso de Insignias  | Barras de progreso para insignias en desarrollo                                            |
| Logros y Insignias | Sistema de Recompensas | Reclamar recompensas de logros completados                                                 |
| Gamificación       | Dashboard de XP        | Mostrar XP actual, progreso al siguiente nivel, historial de XP                            |
| Gamificación       | Sistema de Niveles     | Visualización del nivel actual con beneficios desbloqueados                                |
| Gamificación       | Rankings               | Leaderboards semanales, mensuales y globales                                               |
| Feed de Actividad  | Posts del Usuario      | Lista de publicaciones con interacciones (likes, comentarios, shares)                      |
| Feed de Actividad  | Actividad Reciente     | Timeline de actividades del usuario (logros, posts, interacciones)                         |

## 3. Flujo Principal del Usuario

### Flujo de Usuario Registrado

1. El usuario navega a `/<username>` (su propio perfil o de otro usuario)
2. Ve el perfil completo con tabs de navegación
3. Puede alternar entre diferentes secciones (Posts, Logros, Stats, Info)
4. Si es su propio perfil, puede acceder al modo de edición
5. Puede interactuar socialmente (seguir, enviar mensaje, compartir)

### Flujo de Edición de Perfil

1. Usuario hace clic en "Editar Perfil"
2. Se abre el formulario de edición con vista previa
3. Puede modificar información, subir imágenes
4. Ve cambios en tiempo real
5. Guarda cambios y regresa al perfil actualizado

```mermaid
graph TD
    A[Página de Inicio] --> B[/<username>]
    B --> C[Vista de Perfil]
    C --> D[Tab: Posts]
    C --> E[Tab: Logros]
    C --> F[Tab: Estadísticas]
    C --> G[Tab: Información]
    C --> H[Editar Perfil]
    H --> I[Formulario de Edición]
    I --> J[Vista Previa]
    J --> K[Guardar Cambios]
    K --> C
    E --> L[Galería de Logros]
    E --> M[Progreso de Insignias]
    F --> N[Dashboard de XP]
    F --> O[Rankings]
```

## 4. Diseño de Interfaz de Usuario

### 4.1 Estilo de Diseño

* **Colores Primarios**: Azul (#3B82F6) y Púrpura (#8B5CF6) con gradientes

* **Colores Secundarios**: Gris neutro (#6B7280) y blanco (#FFFFFF)

* **Estilo de Botones**: Redondeados con sombras suaves, efectos hover animados

* **Tipografía**: Inter para texto principal, tamaños 14px-24px

* **Estilo de Layout**: Diseño de tarjetas con espaciado generoso, navegación por tabs

* **Iconos**: Lucide React con estilo minimalista, tamaño consistente 16px-24px

### 4.2 Resumen de Diseño de Páginas

| Nombre de Página | Nombre del Módulo | Elementos de UI                                                                            |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| Perfil Principal | Header de Perfil  | Banner gradiente azul-púrpura, avatar circular 120px, botones con sombras, badges de nivel |
| Perfil Principal | Navegación Tabs   | Tabs horizontales con indicador animado, iconos + texto, hover effects                     |
| Perfil Principal | Estadísticas      | Cards con iconos coloridos, números grandes, barras de progreso animadas                   |
| Editor de Perfil | Formulario        | Inputs con labels flotantes, textarea expandible, switches para privacidad                 |
| Editor de Perfil | Carga de Imágenes | Drag & drop area, crop modal, preview circular para avatar                                 |
| Logros           | Galería           | Grid responsivo 3-4 columnas, cards con gradientes según rareza, animaciones de hover      |
| Logros           | Progreso          | Progress bars con colores temáticos, porcentajes, iconos de recompensas                    |
| Gamificación     | Dashboard XP      | Gráficos circulares, barras de nivel, colores dorados para destacar                        |
| Feed             | Posts             | Cards estilo Facebook, avatares pequeños, botones de interacción, timestamps               |

### 4.3 Responsividad

* **Desktop-first** con adaptación móvil completa

* **Breakpoints**: 768px (tablet), 640px (móvil)

* **Navegación móvil**: Tabs se convierten en dropdown o navegación inferior

* **Optimización táctil**: Botones mínimo 44px, espaciado aumentado en móvil

* **Imágenes responsivas**: Avatar se reduce a 80px en móvil, banner mantiene proporción

## 5. Funcionalidades Técnicas Específicas

### 5.1 Sistema de Gamificación Integrado

* Cálculo automático de XP y niveles

* Sistema de insignias con rareza (común, raro, épico, legendario)

* Notificaciones en tiempo real para logros

* Leaderboards con filtros temporales

### 5.2 Características Sociales

* Sistema de seguimiento (followers/following)

* Mensajería privada integrada

* Compartir perfiles en redes sociales

* Feed de actividad personalizado

### 5.3 Optimizaciones de Rendimiento

* Lazy loading para imágenes y componentes

* Caching de datos de perfil

* Optimización de imágenes automática

* Estados de carga elegantes con skeletons

### 5.4 Migración y Compatibilidad

* Redirecciones automáticas de `/perfil/*` a `/<user>/*`

* Preservación de URLs existentes

* Migración gradual de componentes

* Mantener APIs existentes durante transición

