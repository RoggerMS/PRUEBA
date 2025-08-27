# CRUNEVO — Rediseño del Feed estilo Facebook (Especificación completa)

> **Objetivo**: Reemplazar el feed actual por un feed estilo Facebook, manteniendo identidad CRUNEVO. Reacción principal = **🔥 Fire** (sustituye el like). Listo para demo en producción, con datos semilla, accesibilidad AA, telemetría y soporte tiempo real.

---

## Índice
1. Alcance y principios
2. Arquitectura (frontend y backend esperado)
3. Modelado de datos (TS) y ejemplos JSON
4. Contratos de API (REST) + paginación cursor
5. Tiempo real (WebSocket/SSE) — eventos y semántica
6. Composer: flujos, validación, subida de medios
7. Tarjeta de publicación (PostCard) — layout y estados
8. Reacciones (🔥 por defecto) y reacciones extendidas
9. Comentarios (2 niveles) y moderación básica
10. Compartir (repost) con comentario
11. Hashtags y menciones — búsqueda y navegación
12. Ranking/orden (HOME/Recientes/Guardados)
13. Búsqueda y descubrimiento (search + filtros)
14. Guardados/Bookmarks
15. Notificaciones (enum de eventos, stub de integración)
16. Módulos de sidebar (sugerencias/tendencias/clubes)
17. Gestión de estado: React Query + Zustand (claves, invalidación, optimista)
18. Performance (virtualización, imágenes, prerender)
19. Accesibilidad e i18n (WCAG AA, atajos)
20. Seguridad y moderación (XSS, CSRF, reportes, rate-limit)
21. Analítica/eventos (esquema y naming)
22. Feature flags y configuración
23. Migración desde feed actual (likes → fires)
24. QA/Testing (unit/integration/E2E) + criterios de aceptación
25. Estados vacíos/errores/skeletons
26. Plan de rollout (guardado progresivo, A/B, métricas)
27. Estructura de carpetas y convenciones
28. Lista de componentes y props
29. Diseño/estilos (tokens, microinteracciones 🔥)
30. Roadmap por sprints (opcional)
31. Apéndices (iconografía, ejemplo JSON, pseudo-SQL)

---

## 1) Alcance y principios
- **UX familiar + identidad CRUNEVO**: flujo similar a Facebook para curva de aprendizaje mínima.
- **Accesibilidad primero** (WCAG AA), **mobile‑first** y rendimiento ≥90 Lighthouse.
- **Tiempo real** para conteos y comentarios; **optimistic updates** en acciones.
- **Seguridad**: sanitización, permisos, rate limiting y reporte de contenido.
- **Observabilidad**: analítica de eventos clave y trazas de error.

---

## 2) Arquitectura
### Frontend
- **Next.js (App Router) + TypeScript**
- **UI**: Tailwind + shadcn/ui + lucide-react
- **Estado**: React Query (datos) + Zustand (UI/local flags)
- **Virtualización**: @tanstack/react-virtual para listas largas
- **Media**: `<Image/>` optimizada, lightbox, video player lazy

### Backend esperado (puede mockearse)
- Endpoints REST con **cursor pagination**
- **WS/SSE** para eventos del feed
- Almacenamiento de medios (S3/GCS) con presigned URLs
- Sanitización server-side, anti‑abuso, logging

---

## 3) Modelado de datos (TypeScript)
```ts
export type FeedVisibility = 'public' | 'university' | 'friends' | 'private';
export type FeedKind = 'post'|'photo'|'video'|'question'|'note';

export interface UserLite {
  id: string; handle: string; name: string;
  avatarUrl?: string; badge?: 'verified' | null; career?: string | null;
}

export interface Media {
  id: string; type: 'image'|'video'|'document';
  url: string; thumbUrl?: string; width?: number; height?: number; durationSec?: number;
  mime?: string; sizeBytes?: number;
}

export interface FeedPost {
  id: string;
  kind: FeedKind;
  author: UserLite;
  createdAt: string; // ISO
  visibility: FeedVisibility;
  text?: string;
  media?: Media[];
  tags?: string[]; // hashtags sin '#'
  stats: { fires: number; comments: number; shares: number; views?: number };
  viewerState: { fired: boolean; saved: boolean };
  sharedFrom?: { postId: string; author: UserLite } | null;
}

export interface Comment {
  id: string; postId: string;
  author: UserLite; text: string; createdAt: string;
  parentId?: string | null;
  stats: { fires: number };
  viewerState: { fired: boolean };
}
```

**Ejemplo JSON (post):**
```json
{
  "id": "p_123",
  "kind": "post",
  "author": { "id": "u1", "handle": "ana_r", "name": "Ana", "avatarUrl": "/a.png" },
  "createdAt": "2025-08-27T08:00:00Z",
  "visibility": "university",
  "text": "¡Listo mi apunte de #calculo!",
  "media": [{ "id":"m1","type":"image","url":"/m1.jpg","thumbUrl":"/t1.jpg","width":1280,"height":720 }],
  "tags": ["calculo"],
  "stats": { "fires": 12, "comments": 3, "shares": 1 },
  "viewerState": { "fired": false, "saved": false },
  "sharedFrom": null
}
```

---

## 4) Contratos de API (REST)
**Reglas generales**
- Autenticación por cookie/jwt/bearer; versiona con `/api/v1`.
- **Cursor**: `?cursor=<opaque>&limit=10` (devuelve `nextCursor`).
- Respuestas con `data`, `nextCursor`, `meta` (opcional).

**Feed**
- `GET /api/feed?cursor&limit&ranking=home|recent|saved`
- `POST /api/feed` body `{ kind, text, media[], visibility }` → 201 `{post}`

**Interacciones**
- `POST /api/feed/:id/fire` → `{ delta: +1|-1, fired: boolean, fires: number }`
- `POST /api/feed/:id/save` → `{ saved: boolean }`
- `POST /api/feed/:id/share` body `{ text? , visibility? }` → `{post}`

**Comentarios**
- `GET /api/feed/:id/comments?cursor&limit&order=relevant|recent`
- `POST /api/feed/:id/comments` body `{ text, parentId? }` → `{comment}`
- `POST /api/comments/:id/fire` → `{ delta, fired, fires }`

**Búsqueda/hashtags**
- `GET /api/feed/search?q=<query or #tag>&cursor&limit` → mezcla por tipo

**Tiempo real**
- `GET /api/feed/notify` (SSE) o `WS /api/feed/ws`
- Eventos: ver sección 5.

**Errores (convención)**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "text required" } }
```

---

## 5) Tiempo real — WS/SSE
**Tipos de evento** (`type`):
- `post.stats` `{ postId, delta: { fires?:number, comments?:number, shares?:number } }`
- `post.created` `{ post: FeedPost }` (si aplica al timeline del viewer)
- `comment.created` `{ postId, comment: Comment }`
- `comment.stats` `{ commentId, delta: { fires?: number } }`

**Semántica**
- Idempotencia por `eventId` y `ts` (para evitar duplicados).
- Backoff exponencial en reconexión. Heartbeat cada 20–30s.

---

## 6) Composer
- Caja superior con avatar y placeholder. Click abre **modal** con tabs:
  - **Post** (texto + contador + preview hashtags/mentions).
  - **Foto/Video** (dropzone, reordenar, validación de tamaño/mime).
  - **Pregunta**: deep‑link a `/forum/ask` (con retorno).
  - **Apunte**: subir archivo o enlazar apunte existente.
- **Visibilidad**: public/university/friends/private.
- **Optimistic create**: inyectar “post fantasma” con spinner hasta confirmación.
- Validaciones: longitudes, mimetypes, nº máximo de medios, enlaces seguros.
- Subidas: presigned URLs; mostrar progreso por archivo.

---

## 7) PostCard (layout y estados)
- **Header**: avatar + nombre + `@handle` + badge ✓ + carrera + tiempo + menú `…` (guardar, copiar enlace, ocultar, reportar).
- **Body**: texto con `line-clamp-6` + “Ver más”; autolink de `#tags` y `@mentions`.
- **MediaGrid**: 1 (full), 2 (1x2), 3 (2 arriba/1 abajo), 4 (2x2) + lightbox; video con mini‑preview.
- **Footer** (estilo FB pero CRUNEVO): botones **🔥 Fire**, **Comentar**, **Compartir**, **Guardar**.
- **Microinteracción 🔥**: animación *burst* y contador incremental accesible (aria‑live polite).
- Estados: cargando (skeleton), error (retry), contenido sensible (tap‑to‑reveal).

---

## 8) Reacciones
- **Default**: 🔥 (toggle). Contador principal muestra 🔥.
- **Extendidas** (opcional): ❤️ 😮 👏 📚 accesibles por long‑press/hover; backend puede mapear a un set genérico de “reactions”.

---

## 9) Comentarios
- Hilo con 2 niveles; mostrar N primeros, “Ver respuestas (n)” para expandir.
- Composer inline (Enter envía, Shift+Enter salto).
- Orden: “Más relevantes” o “Recientes”.
- Reacción 🔥 a comentarios.
- Moderación: ocultar por reportes/score bajo, mostrar aviso al usuario.

---

## 10) Compartir (repost)
- Modal “Compartir” con comentario opcional y visibilidad. Mantener backlink “Compartido de @autor” y preservar stats del original.

---

## 11) Hashtags y menciones
- Click `#tag` → `/search?q=#tag` (pestañas: Todo, Posts, Apuntes, Preguntas).
- `@mention` autocompleta usuarios (debounce 250ms).

---

## 12) Ranking/orden
- **HOME**: mezcla recencia (decay), afinidad (interacciones previas), diversidad (autor/tema), *heat* (🔥 + comentarios recientes), penalización por repetidos.
- **Recientes**: orden cronológico estricto.
- **Guardados**: favoritos del usuario, orden por fecha de guardado.

---

## 13) Búsqueda y descubrimiento
- Endpoint `/api/feed/search`; filtros por tipo (post/photo/video/note/question), fecha, carrera, hashtags.
- Resultados con chips y recuentos rápidos.

---

## 14) Guardados
- Toggle bookmark en PostCard; vista `/saved` con filtros y búsqueda interna.

---

## 15) Notificaciones (stub)
- Eventos: `post_shared`, `post_commented`, `comment_replied`, `post_fired`, `mention`.
- API: `GET /api/notifications?cursor&limit`, `POST /api/notifications/:id/read`.

---

## 16) Sidebar
- **Usuarios sugeridos** (seguir/seguir).  
- **Clubes recomendados** (unirse).  
- **Tendencias** (temas, chips con recuento y variación).  
- Reutiliza componentes existentes, unifica estilos y espaciados.

---

## 17) Estado: React Query + Zustand
**Claves**:  
- `['feed', ranking]`, `['post', id]`, `['comments', postId, order]`  
- **Invalidación**: al hacer 🔥 o comentar, actualizar caché de post y lista.  
- **Optimista**: aplicar delta local; revertir si error.

**Ejemplo toggle 🔥 (optimista)**
```ts
useMutation(toggleFire, {
  onMutate: async ({ postId }) => {
    await queryClient.cancelQueries({ queryKey: ['post', postId] });
    const prev = queryClient.getQueryData(['post', postId]);
    queryClient.setQueryData(['post', postId], p => p && ({
      ...p, viewerState: { ...p.viewerState, fired: !p.viewerState.fired },
      stats: { ...p.stats, fires: p.stats.fires + (p.viewerState.fired ? -1 : +1) }
    }));
    return { prev };
  },
  onError: (_e, { postId }, ctx) => ctx?.prev && queryClient.setQueryData(['post', postId], ctx.prev),
  onSettled: (_d, _e, { postId }) => queryClient.invalidateQueries({ queryKey: ['post', postId] }),
});
```

---

## 18) Performance
- Virtualización desde 50 ítems.  
- Imágenes con blur y `loading="lazy"`.  
- Split de lightbox/video; Suspense + streaming donde aplique.  
- Prefetch de siguientes páginas al 80% del scroll.

---

## 19) Accesibilidad e i18n
- `aria-pressed` en 🔥; `aria-live` en cambios de conteo.  
- Atajos: **J/K** navegar, **F** 🔥, **C** comentar, **S** guardar.  
- Etiquetas y roles adecuados; contraste ≥4.5:1.  
- Textos en `i18n/es.json` con interpolaciones seguras.

---

## 20) Seguridad y moderación
- Sanitizar texto (XSS), limitar longitud y nº de medios.  
- CSRF/cookies seguras; rate‑limits por IP/usuario.  
- `/api/moderation/report` para reportes; registro de auditoría.  
- Detección básica de spam (en cola asincrónica).

---

## 21) Analítica
Eventos sugeridos (payload mínimo):  
- `feed_impression`, `post_view`, `fire_click`, `comment_submit`, `share_click`, `save_toggle`, `composer_open`, `load_more`  
- Incluye `postId`, `position`, `ranking`, `abVariant`, `ts`.  
- Correlaciona con errores (Sentry/OTEL).

---

## 22) Feature flags
- `storiesEnabled`, `longReactionsEnabled`, `rankingVariant`, `realtime` on/off.  
- Inyectar por contexto/Zustand; persistir en localStorage para debugging.

---

## 23) Migración (likes → fires)
- Script server que mapea `likes_count → fires` y `user_like → viewerState.fired`.
- Mantén compatibilidad temporal en endpoints si hay clientes viejos.

**Pseudo‑SQL**
```sql
ALTER TABLE posts ADD COLUMN fires INT DEFAULT 0;
UPDATE posts SET fires = likes_count;

ALTER TABLE post_user_reactions
  RENAME COLUMN liked TO fired;
```

---

## 24) QA/Testing
- **Unit**: PostCard, ActionsBar, CommentsList, toggle 🔥 reducer.  
- **Integration**: composer -> create, optimistic updates y rollback.  
- **E2E**: scroll infinito, comentar, compartir, guardar, filtro por ranking.  
- **Acc. tests**: roles, focus, atajos, lector de pantalla.

**Criterios de aceptación (resumen)**
- `/feed` con composer funcional (texto + imagen/video).  
- Scroll infinito; 🔥 optimista con animación.  
- Comentarios 2 niveles; compartir con comentario.  
- Guardados y vista de guardados.  
- Hashtags clicables. Lighthouse ≥90 desktop.

---

## 25) Estados vacíos/errores/skeletons
- Vacíos con CTA (seguir usuarios, unirse a clubes, subir apunte).  
- Skeletons consistentes para PostCard y comentarios.  
- Errores con retry y mensajes i18n.

---

## 26) Rollout
- Fase 1: grupo interno (10%), métrica de engagement (fires/post, comentarios/post).  
- Fase 2: 50% con A/B en ranking.  
- Fase 3: 100% + hardening.  
- Deshacer: feature flag `newFeedEnabled`.

---

## 27) Estructura de carpetas
```
src/features/feed/
  components/
    Composer.tsx
    PostList.tsx
    PostCard.tsx
    MediaGrid.tsx
    ActionsBar.tsx
    CommentsList.tsx
    ShareModal.tsx
    SaveButton.tsx
  hooks/
    useFeed.ts
  api/
    feed.client.ts
  store.ts
  types.ts
FeedPage.tsx
```

---

## 28) Componentes y props (resumen)
```ts
// PostCard
interface PostCardProps { post: FeedPost; onOpenShare():void; }
// ActionsBar
interface ActionsBarProps { post: FeedPost; onToggleFire():void; onCommentClick():void; onShare():void; onSave():void; }
// CommentsList
interface CommentsListProps { postId: string; order: 'relevant'|'recent'; }
```

---

## 29) Diseño/estilos
- Tokens: color primario CRUNEVO, gradientes cálidos, radios `rounded-2xl`, sombras suaves.  
- **🔥** en gama naranja/rojo (`from-orange-400 to-red-500`).  
- Animación `burst` (CSS/Framer Motion) al togglear 🔥.  
- Consistencia en paddings (`p-4` tarjetas), tipografía y estados hover.

**Pseudo‑CSS del burst**
```css
.fire-burst { animation: burst .35s ease-out; }
@keyframes burst {
  0% { transform: scale(0.8); filter: brightness(0.9); }
  60% { transform: scale(1.15); filter: brightness(1.2); }
  100% { transform: scale(1); filter: brightness(1); }
}
```

---

## 30) Roadmap por sprints (opcional)
- **Sprint 1**: estructura, PostList, PostCard básico, Composer texto, 🔥.  
- **Sprint 2**: media (fotos/video), comentarios, compartir, guardados.  
- **Sprint 3**: ranking HOME, realtime, búsqueda/hashtags.  
- **Sprint 4**: rendimiento, accesibilidad, QA y rollout.

---

## 31) Apéndices
**Iconografía**: lucide `flame` para 🔥 (o SVG propio).  
**Ejemplo eventos WS**:
```json
{ "type":"post.stats", "postId":"p_123", "delta": { "fires": 1 }, "eventId":"e1","ts":1693123123 }
```
**Ejemplo body create post**:
```json
{ "kind":"photo", "text":"Hola #crunevo", "media":[{"id":"temp1","type":"image","url":"https://..."}], "visibility":"university" }
```

---

**Nota final**: Esta especificación es la fuente de verdad para Codex/implementación. Si el backend aún no está listo, crear **mocks** (MSW) con los contratos definidos y habilitar **feature flags** para rollout seguro.
