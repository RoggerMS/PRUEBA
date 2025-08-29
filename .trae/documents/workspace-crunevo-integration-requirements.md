# Integración Workspace en Ecosistema CRUNEVO

## 1. Visión General del Proyecto

Integración de Workspace (pizarra infinita con bloques Docs/Kanban/Frases) como microservicio dentro del ecosistema CRUNEVO existente, manteniendo total compatibilidad con rutas y servicios actuales. La implementación sigue el patrón strangler para despliegue gradual sin regresiones.

- **Objetivo Principal**: Añadir funcionalidad Workspace sin modificar servicios existentes
- **Enfoque**: Microservicio NestJS con integración transparente vía API Gateway
- **Valor de Mercado**: Expansión de capacidades colaborativas manteniendo estabilidad del ecosistema

## 2. Funcionalidades Principales

### 2.1 Roles de Usuario

| Rol | Método de Registro | Permisos Principales |
|-----|-------------------|---------------------|
| Usuario Autenticado | Auth0 + NextAuth (existente) | Acceso completo a sus boards/blocks de Workspace |
| Administrador | Sistema existente | Monitoreo y métricas del servicio Workspace |

### 2.2 Módulos de Funcionalidad

Nuestros requisitos de integración consisten en las siguientes páginas principales:

1. **Página Workspace Principal**: canvas infinito, selector de boards, contador de bloques
2. **Página Board Específico**: vista detallada del board con bloques arrastrables
3. **Páginas de Herramientas**: editores específicos para Docs, Kanban y Frases
4. **Páginas Existentes CRUNEVO**: mantener intactas todas las rutas actuales

### 2.3 Detalles de Páginas

| Nombre de Página | Nombre del Módulo | Descripción de Funcionalidad |
|------------------|-------------------|------------------------------|
| Workspace Principal | Canvas Infinito | Mostrar boards disponibles, crear nuevos boards, navegación entre boards |
| Workspace Principal | Selector de Boards | Cambiar entre boards del usuario, mostrar board por defecto |
| Workspace Principal | Contador de Bloques | Mostrar límite 100 bloques, bloquear botón "Nuevo bloque" al alcanzar límite |
| Board Específico | Bloques Arrastrables | Crear, mover, redimensionar bloques (x,y,w,h,zIndex) |
| Board Específico | Toggle Editar/Completar | Alternar entre modo edición y visualización |
| Board Específico | Doble Clic | Abrir herramienta específica del bloque |
| Herramienta Docs | Editor de Páginas | CRUD de páginas con autosave, navegación entre páginas |
| Herramienta Kanban | Gestión de Columnas | CRUD de columnas y tarjetas con drag & drop |
| Herramienta Frases | Lista de Elementos | CRUD de frases con ordenamiento |
| Rutas CRUNEVO | Preservación Total | Mantener /notes, /forum, /marketplace, /profile, /gamification, /notifications, /admin |

## 3. Flujo Principal de Procesos

**Flujo de Usuario Autenticado:**

1. Usuario accede a /workspace desde navegación existente de CRUNEVO
2. Sistema carga board por defecto del usuario
3. Usuario puede crear/editar bloques hasta límite de 100
4. Doble clic en bloque abre herramienta específica (Docs/Kanban/Frases)
5. Toggle Editar/Completar controla modo de interacción
6. Cambios se guardan automáticamente con debounce
7. Eventos en tiempo real se publican vía Kafka

```mermaid
graph TD
    A[Usuario Autenticado] --> B[/workspace]
    B --> C[Cargar Board Default]
    C --> D[Canvas Infinito]
    D --> E[Crear/Editar Bloques]
    E --> F{Límite 100?}
    F -->|No| G[Permitir Nuevo Bloque]
    F -->|Sí| H[Bloquear Botón]
    G --> I[Doble Clic Bloque]
    I --> J[Abrir Herramienta]
    J --> K[Docs Editor]
    J --> L[Kanban Board]
    J --> M[Frases List]
    K --> N[Autosave]
    L --> N
    M --> N
    N --> O[Eventos Kafka]
```

## 4. Diseño de Interfaz de Usuario

### 4.1 Estilo de Diseño

- **Colores Primarios**: Mantener paleta morado-azulado de CRUNEVO (#6366f1, #8b5cf6)
- **Colores Secundarios**: Grises neutros para canvas (#f8fafc, #e2e8f0)
- **Estilo de Botones**: Redondeados con sombras suaves, consistente con CRUNEVO
- **Tipografía**: Inter 14px para texto general, 16px para títulos de bloques
- **Estilo de Layout**: Canvas infinito con toolbar superior, sidebar de herramientas
- **Iconos**: Lucide React para consistencia con ecosistema existente

### 4.2 Resumen de Diseño de Páginas

| Nombre de Página | Nombre del Módulo | Elementos de UI |
|------------------|-------------------|----------------|
| Workspace Principal | Header | Logo CRUNEVO, navegación existente, selector de boards, contador bloques |
| Workspace Principal | Canvas Infinito | Fondo grid sutil, zoom controls, minimap opcional |
| Workspace Principal | Toolbar | Botones Nuevo Bloque (con estado disabled), Toggle Editar/Completar |
| Board Específico | Bloques Arrastrables | Bordes redondeados, handles de resize, indicador zIndex |
| Herramientas | Modal/Sidebar | Overlay semi-transparente, contenido específico por herramienta |

### 4.3 Responsividad

Enfoque desktop-first como especificado en requisitos de Workspace. En móvil mostrar lista simplificada sin funcionalidad de arrastre, manteniendo acceso a herramientas vía navegación táctil.

## 5. Integración con Módulos Existentes

### 5.1 Preservación de Funcionalidades

- **Gamificación/Crolars**: No modificar lógica existente, opcionalmente emitir eventos crolar_earned
- **Notificaciones**: Integrar "workspace updates" en centro existente sin cambiar contratos
- **Search/OpenSearch**: Workspace mantiene datos propios, no afecta índices existentes
- **Auth**: Reutilizar flujo Auth0 + NextAuth sin modificaciones

### 5.2 Eventos de Integración

- `workspace.block:created` - Nuevo bloque creado
- `workspace.block:moved` - Bloque reposicionado
- `workspace.block:deleted` - Bloque eliminado
- `workspace.board:switched` - Cambio de board activo
- `crolar_earned` - Opcional para gamificación futura
