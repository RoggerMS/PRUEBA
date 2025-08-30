# Unificación del Sistema de Perfiles - Requerimientos del Producto

## 1. Resumen del Proyecto

Unificar las vistas de perfil público y privado para proporcionar una experiencia consistente, corregir problemas de alineación en iconos de cámara y crear una ruta pública dedicada para perfiles de usuario.

## 2. Características Principales

### 2.1 Roles de Usuario

| Rol                 | Método de Acceso                          | Permisos Principales                                       |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| Usuario Propietario | Sesión autenticada en /perfil             | Puede ver y editar su perfil, acceder a todas las pestañas |
| Usuario Público     | Acceso directo a /u/\[username]           | Solo puede ver información pública del perfil              |
| Usuario Autenticado | Acceso a /u/\[username] de otros usuarios | Puede ver perfiles públicos de otros usuarios              |

### 2.2 Módulos de Funcionalidad

Nuestros requerimientos de perfil consisten en las siguientes páginas principales:

1. **Perfil Privado (/perfil)**: header unificado, pestañas de navegación (Perfil/Logros/Estadísticas/Configuración), botón "Editar perfil".
2. **Perfil Público (/u/\[username])**: mismo header que vista privada pero sin controles de edición, información pública del usuario.
3. **Editor de Perfil**: vista de edición con iconos de cámara alineados correctamente, botón "Ver como Público" que redirige a ruta pública.

### 2.3 Detalles de Páginas

| Nombre de Página | Nombre del Módulo      | Descripción de Funcionalidad                                                                     |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| Perfil Privado   | Header Unificado       | Mostrar banner, avatar, nombre, @username, ubicación, universidad. Botón "Editar perfil" visible |
| Perfil Privado   | Pestañas de Navegación | Tabs para Perfil, Logros, Estadísticas, Configuración                                            |
| Perfil Privado   | Contenido Principal    | Mostrar información personal, intereses, estadísticas según pestaña activa                       |
| Perfil Público   | Header Unificado       | Mismo diseño que vista privada pero sin botones de edición ni iconos de cámara                   |
| Perfil Público   | Información Pública    | Mostrar datos públicos: bio, ubicación, universidad, intereses, logros públicos                  |
| Editor de Perfil | Iconos de Cámara       | Botones de cámara correctamente alineados para banner (top-right) y avatar (bottom-right)        |
| Editor de Perfil | Formulario de Edición  | Campos editables para información personal, bio, intereses, enlaces sociales                     |
| Editor de Perfil | Vista Previa Pública   | Botón "Ver como Público" que redirige a /u/\[username]                                           |

## 3. Proceso Principal

### Flujo de Usuario Propietario

1. Usuario accede a /perfil
2. Ve su perfil con header unificado (banner + avatar + datos)
3. Puede navegar entre pestañas (Perfil, Logros, Estadísticas, Configuración)
4. Al hacer clic en "Editar perfil", accede al editor con iconos de cámara
5. En el editor, puede hacer clic en "Ver como Público" para ir a /u/\[username]
6. Desde la vista pública puede regresar a su perfil privado

### Flujo de Usuario Público

1. Usuario accede a /u/\[username] directamente o desde enlace
2. Ve el perfil público con el mismo header design pero sin controles de edición
3. Puede ver información pública: bio, ubicación, universidad, intereses, logros
4. No tiene acceso a pestañas privadas ni funciones de edición

```mermaid
graph TD
    A[/perfil - Vista Privada] --> B[Pestañas: Perfil/Logros/Stats/Config]
    A --> C[Botón "Editar perfil"]
    C --> D[Editor de Perfil]
    D --> E[Botón "Ver como Público"]
    E --> F[/u/username - Vista Pública]
    F --> G[Header Unificado sin edición]
    G --> H[Información Pública]
    
    I[Usuario Externo] --> F
    J[Enlaces Compartidos] --> F
```

## 4. Diseño de Interfaz de Usuario

### 4.1 Estilo de Diseño

* **Colores primarios**: Azul (#3B82F6) y morado (#8B5CF6) para gradientes

* **Colores secundarios**: Gris (#6B7280) para texto secundario, blanco (#FFFFFF) para fondos

* **Estilo de botones**: Redondeados con sombras suaves, iconos de Lucide React

* **Fuentes**: Sistema de fuentes por defecto, tamaños: 2xl para títulos, base para texto

* **Estilo de layout**: Basado en cards con Tailwind CSS, navegación por pestañas

* **Iconos**: Lucide React para consistencia (Camera, Edit3, MapPin, GraduationCap, etc.)

### 4.2 Resumen de Diseño de Páginas

| Nombre de Página | Nombre del Módulo   | Elementos de UI                                                                                                                    |
| ---------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Perfil Privado   | Header Unificado    | Banner con gradiente azul-morado, avatar circular 128px con borde blanco, nombre en text-2xl font-bold, @username en text-gray-600 |
| Perfil Privado   | Botón Editar        | Button outline con icono Edit3, posicionado top-right del header                                                                   |
| Editor de Perfil | Icono Cámara Banner | Button secondary, 32px, absolute top-2 right-2, bg-white/80 hover:bg-white                                                         |
| Editor de Perfil | Icono Cámara Avatar | Button secondary, 32px, absolute bottom-2 right-2, bg-white shadow-md                                                              |
| Perfil Público   | Header Unificado    | Mismo diseño que privado pero sin botones de edición, sin iconos de cámara                                                         |
| Perfil Público   | Información         | Cards con información pública, badges para intereses, iconos para ubicación/universidad                                            |

### 4.3 Responsividad

Diseño mobile-first con adaptaciones para desktop:

* **Mobile (sm)**: Header apilado verticalmente, avatar centrado, botones full-width

* **Tablet (md)**: Header horizontal, avatar a la izquierda, información a la derecha

* **Desktop (lg)**: Layout completo con sidebar, header expandido, máximo ancho 4xl

* **Interacción táctil**: Botones de mínimo 44px para accesibilidad táctil

