# PROMPT PARA UNA IA QUE ESCRIBE CÓDIGO

**Rol que debes adoptar:** Arquitecto/a de software y desarrollador/a full‑stack senior. Eres responsable de diseñar, implementar y documentar **CRUNEVO**, una **red social educativa** para universidad, con economía virtual llamada **Crolars** (también escrito “crollars”), un **marketplace**, **cursos**, **apuntes** (subida/visualización de documentos), **foro tipo Brainly**, **clubes**, **eventos**, **ranking**, **liga académica**, **desafíos**, **chat**, **notificaciones**, un **perfil con vista privada/pública** y un **“Espacio Personal”** (pizarra editable con bloques arrastrables). Incluye **CruneBot** (chat de IA desactivado por ahora) y futura suscripción **Crunevo+**.

> **Objetivo**: Entregar una aplicación web moderna, segura, accesible y responsive, lista para demo en producción, con semilla de datos y panel de administración básico.

---

## 0) Pistas de arquitectura y stack sugerido (puedes proponer mejoras justificadas)

* **Frontend**: Next.js 14 (App Router, RSC) + TypeScript, Tailwind CSS + shadcn/ui, React Query, Zustand para estado ligero. Iconos: Lucide, Bootstrap Icons cuando se especifique (p. ej., “fuego” para reacciones).
* **Backend**: Node.js (NestJS o Express) + TypeScript. Validación con Zod o class‑validator.
* **DB**: PostgreSQL con Prisma ORM.
* **Cache/colas**: Redis (rate limiting, sesiones, colas BullMQ para emails, notifs, generación de previews de docs).
* **Storage**: S3/R2 para archivos (apuntes, imágenes, banners). Miniaturas y previews generadas en workers.
* **Tiempo real**: WebSockets (Socket.IO) o SSE para notificaciones/chat/estado del tablero del Espacio Personal.
* **Email**: Resend (confirmación, reset, notifs).
* **Auth**: Auth.js/NextAuth o Clerk (email/usuario+password; 2FA opcional). Sesiones JWT con rotación de tokens.
* **Pagos reales (opcional demo)**: Stripe o Culqi (Perú). Abstraer capa de pagos.
* **Búsqueda**: PostgreSQL full‑text inicialmente; interfaz preparada para Elastic u OpenSearch.
* **Infra**: Monorepo (turborepo). Deploy en Vercel + Fly/DigitalOcean/Render para backend/colas si separas.
* **Docs**: OpenAPI/Swagger (backend), Storybook opcional para UI.
* **Calidad**: ESLint, Prettier, Husky + lint‑staged, Vitest/Jest + Playwright para E2E.
* **Accesibilidad**: WCAG 2.2 AA (focus states, roles ARIA, contraste, navegación por teclado).
* **Seguridad**: CSRF, CORS, CSP estricta, Helmet, sanitización HTML, subida con antivirus opcional (ClamAV), límites de tamaño (
  p. ej., 50 MB por archivo). Auditoría y logs estructurados.

> Si eliges otro stack, mantén equivalentes funcionales y explica por qué.

---

## 1) Identidad visual y UX global

* **Tema**: Paleta **morado‑azulado muy claro** (tendiendo a blanco). Barra superior (Navbar) con gradiente suave morado→azulado pálido.
* **Tipografía**: Sistema o Inter.
* **Layout**: En feed, **panel izquierdo** (navegación, accesos rápidos, tendencias) y **panel derecho** (sugerencias, anuncios, widgets). Contenido central con tarjetas minimalistas sin marcos duros (glass/soft shadow).
* **Botón acción flotante** “+” (abajo‑derecha) con menú: **Nota rápida**, **Atajos de teclado**, **CruneBot**.
* **Reacciones**: El “me gusta” es **🔥** (fuego), además comentar y compartir. Menú de tres puntos: **Guardar**, **Copiar enlace**, **No me interesa**, **Denunciar**.
* **Responsive**: Móvil prioritario (Navbar superior condensada; menú lateral en drawer).

---

## 2) Módulos y páginas principales

### 2.1 Autenticación y Onboarding

* **Login** (estilo inspirado en Facebook, pero propio): fondo **morado muy claro**, formulario con **correo o usuario** + **contraseña**. El toggle de contraseña NO es ojo: usa **dos iconos de mono** (🙈 cubrir/🙉 mostrar).
* **Registro**: nombre, apellidos, **nombre de usuario**, correo, contraseña, fecha de nacimiento, **género** (mujer/hombre/personalizado), check de **aceptación de Términos y Condiciones**. Texto legal bajo el botón. Verificación por email (Resend).
* **Recuperar contraseña** por email.

### 2.2 Feed (Inicio)

* **Tipos de publicación**: (a) **Pregunta directa al foro**; (b) **Subir foto**; (c) **Subir apunte/documento**; (d) texto normal.
* **Contenido mostrado**: preguntas, publicaciones normales, **apuntes relevantes**.
* **Accesos rápidos** en panel izquierdo: Subir apunte, Hacer pregunta, Publicar.
* **Tendencias**: hashtags, preguntas destacadas, mejores apuntes.
* **Racha semanal**: widget para **reclamar Crolars** (ver reglas en §5).

### 2.3 Apuntes (Documentos)

* Subida de **Word, PPT, Excel, PDF, imágenes, txt**. Metadatos: título, descripción, etiquetas, carrera, curso, opcional **precio en Crolars** (si creador quiere monetizar).
* Vista de galería con **preview**; tarjeta con: título, miniatura, autor, métricas, menú.
* **Visor** interno tipo PDF: paginación (←/→), zoom, **descargar**, **solicitar impresión** (simulado), comentarios, valoraciones.

### 2.4 Foro estudiantil (tipo Brainly)

* Publicar **preguntas** (título+detalle+tags).
* **Respuestas** con votos ↑/↓, comentarios, **marcar “Mejor respuesta”** por autor/a de la pregunta.
* Sistema de **puntos/experiencia** por participación (ver §6 Niveles/Ranking).

### 2.5 Marketplace (Tienda)

* **Marketplace abierto** (cualquiera compra/vende). Filtros: categoría, precio, estado, vendedor, “**Oficial Crunevo**”.
* **Etiqueta** “Oficial Crunevo” para productos del **store oficial**.
* **Carrito** para ver seleccionados y compras previas.
* **Crolars**: inicialmente **solo válidos en la tienda oficial** (ver §5). Dejar bandera para permitir Crolars en vendedores externos en el futuro.

### 2.6 Cursos

* Listado de cursos (video), detalle con lecciones, progreso, valoraciones.
* Algunos cursos pueden requerir Crolars o suscripción **Crunevo+**.

### 2.7 Clubes (tipo grupos Facebook/Reddit)

* Crear/editar **club**: nombre, descripción, **banner/portada** y **avatar**.
* Publicaciones internas, reglas, moderación, solicitud de ingreso, roles (admin/moderador/miembro).

### 2.8 Eventos

* Calendario/lista de **eventos universitarios**. Inscripción/Interesado, recordatorios.

### 2.9 “Mi carrera”

* Al registrarse, el usuario elige su **carrera** → se crea sección “**Mi carrera**” con feed, apuntes, cursos, clubes, eventos y **chat** de la carrera.
* **Destacados**: placeholder con tarjetas de contenido recomendado por carrera (curación simple por ahora: p. ej., más guardados/visitados de esa carrera).

### 2.10 Liga académica (torneos)

* Equipos de estudiantes responden retos por rondas, **tabla de posiciones**, **medallas/insignias** para Top 3 y **recompensas**.

### 2.11 Desafíos (enseñar a otros)

* Creadores publican mini‑lecciones/retos, la comunidad **vota** al mejor “profesor”. Recompensas y visibilidad.

### 2.12 CruneBot (IA)

* Chat **desactivado** por ahora. Mostrar **preguntas rápidas** con respuestas genéricas:

  * ¿Cómo funciona Crunevo?
  * ¿Cómo ganar Crolars?
  * ¿Cómo funcionan los clubes?
  * ¿Cómo subir apuntes?
* Preparar **proveedor abstracto** para integrar OpenAI u otra IA en el futuro.

### 2.13 Espacio Personal (Personal Space)

* **Pizarra inmensa** con **bloques** arrastrables: Notas, Tareas, Kanban, Objetivos, Calendario, Gráfico, Cita/Frase, etc.
* **Modo Edición**: permite arrastrar/soltar y redimensionar; **Modo Completar**: persiste posiciones y desactiva edición.
* Botón flotante “+” de la app crea **Nota rápida** aquí.

### 2.14 Perfil

* **Dos vistas**: **Privada (yo)** y **Pública (como me ven)**.
* Tabs personales: Publicaciones, **Apuntes**, **Logros**, **Misiones**, **Compras** (solo privada), **Referidos**.
* Si no hay publicaciones: mostrar “Crea tu primera publicación”.

### 2.15 Notificaciones

* Centro unificado: feed, apuntes, foro, tienda, cursos, clubes, eventos, liga, desafíos, rachas, Crolars. Filtrar por tipo, marcar como leído, preferencias. Tiempo real.

### 2.16 Configuración

* Perfil: nombre de usuario, bio, foto, **info académica** (carrera), intereses.
* **Tienda**: mostrar tienda pública, verificación de vendedor.
* **Verificación de cuenta** (badges).
* **Tema** claro/oscuro.
* **Notificaciones** granular.
* **Crunevo+** (suscripción) estado/planes.
* **Centro de ayuda y legal**: Términos, Privacidad, Cookies. Texto base:

  * **Términos**: “Crunevo es una plataforma educativa peruana dedicada a conectar estudiantes mediante intercambio de apuntes, recursos, foros de ayuda, tiendas estudiantiles y herramientas de inteligencia artificial.” Completar con licencias, limitaciones, reglas de conducta y uso de contenido.
  * **Privacidad**: minimización de datos, fines educativos, seguridad, derechos ARCO, contacto soporte.
  * **Cookies**: manager con consentimiento granular.

---

## 3) Navegación y menús

* **Navbar** superior con logo y buscador global. A la derecha: ícono de notificaciones, botón “+” (opcional duplicado en desktop), **menú estilo Facebook** que abre **drawer** con: **Mi perfil**, **Espacio Personal**, **Misiones**, **Liga**, **Desafíos**, **Eventos**, **Ajustes**, **CruneBot** (desactivado). Puedes añadir “Ayuda” y “Soporte”.
* **Sidebar izquierda** en Inicio: Inicio, Mi perfil, Mi espacio personal, Apuntes, Foro, Clubes, Eventos, Cursos, Tienda, Misiones, Ranking, IA/CruneBot, **Tendencias**, **Accesos rápidos**.
* **Footer**: “© 2025 Crunevo — Construyendo el Futuro Educativo • Sobre Crunevo • Cookies • Privacidad • Términos”.

---

## 4) Modelo de datos (mínimo)

> Usa nombres en inglés en DB, pero conserva marcas en UI en español.

### 4.1 Usuarios y perfiles

* `User(id, email, username, password_hash, full_name, gender, dob, role[student,mod,admin], bio, avatar_url, banner_url, interests[text[]], verified_bool, created_at)`
* `AcademicProfile(user_id PK/FK, major_id, university, semester, join_year)`
* `CareerMajor(id, name)`
* `Referral(user_id, code, referred_by, credited_crolars)`
* `LevelProgress(user_id, level, xp, last_calculated_at)`
* `Streak(user_id, current_streak_days, last_claim_date, week_number)`
* `CrolarsLedger(id, user_id, delta, reason, ref_table, ref_id, balance_after, created_at)` **(libro contable inmutable)**

### 4.2 Contenido social

* `Post(id, author_id, type[feed|question|note], text, media_url[], created_at, visibility, career_major_id?)`
* **Foro**:

  * `Question(id, author_id, title, body, tags[], votes, accepted_answer_id, created_at)`
  * `Answer(id, question_id, author_id, body, votes, is_accepted, created_at)`
* **Apuntes**:

  * `Note(id, author_id, title, description, tags[], file_key, file_type, pages_int?, preview_images[], price_crolars_int?, price_currency?, created_at)`
  * `NoteView(id, note_id, user_id, page, created_at)`
* Reacciones/Guardados/Reportes:

  * `Reaction(id, user_id, target_table, target_id, kind[fire|up|down])`
  * `Save(id, user_id, target_table, target_id, created_at)`
  * `Report(id, reporter_id, target_table, target_id, reason, status[pending|resolved])`

### 4.3 Clubes y eventos

* `Club(id, name, description, avatar_url, banner_url, privacy[public|private], created_by, created_at)`
* `ClubMember(club_id, user_id, role[admin|mod|member], joined_at)`
* `Event(id, title, description, starts_at, ends_at, location, organizer_id, career_major_id?)`
* `EventAttendee(event_id, user_id, status[going|interested])`

### 4.4 Cursos

* `Course(id, title, description, cover_url, price_crolars?, visibility, created_by)`
* `Lesson(id, course_id, title, video_url, duration_sec, order)`
* `Enrollment(user_id, course_id, progress_pct, completed_at)`

### 4.5 Marketplace

* `Product(id, seller_id, title, description, images[], category, price_currency, price_amount, allow_crolars_bool, is_official_bool, stock, created_at)`
* `Order(id, buyer_id, total_currency, total_amount, total_crolars, status, created_at)`
* `OrderItem(order_id, product_id, qty, price_currency, price_amount, price_crolars)`
* `CartItem(user_id, product_id, qty)`
* `PayoutRequest(id, user_id, crolars_amount, fiat_amount, status[pending|approved|rejected], created_at)`

### 4.6 Gamificación y organización

* `RankingSnapshot(id, period[weekly|monthly], metrics_json, created_at)`
* `Mission(id, title, description, reward_crolars)` • `UserMission(user_id, mission_id, status)`
* `Challenge(id, title, description, career_major_id?, starts_at, ends_at)` • `ChallengeVote(challenge_id, voter_id, target_user_id, score)`
* `League(id, season, rules)` • `LeagueTeam(id, league_id, name, captain_id)` • `LeagueMatch(id, league_id, round, team_a_id, team_b_id, score_a, score_b)`

### 4.7 Comunicación y notificaciones

* `Conversation(id, title?, is_group_bool, career_major_id?)` • `ConversationMember(conversation_id, user_id)` • `Message(id, conversation_id, sender_id, body, attachments[])`
* `Notification(id, user_id, type, payload_json, read_at, created_at)`

---

## 5) Reglas de negocio (Crolars, rachas, referidos)

* **Conversión**: **5,000 Crolars = 5 soles** (mínimo de retiro). Mantener en constantes y en tabla de parámetros.
* **Racha semanal** (7 días, se reinicia cada semana):

  * Día 1: **1** Crolar, Día 2: **2**, Día 3: **3**, Día 4: **4**, Día 5: **5**, Día 6: **7**, Día 7: **10**.
  * Un botón en el feed permite **reclamar** el día correspondiente; validar días consecutivos.
* **Referidos**: **100 Crolars por persona** hasta **5 referidos** (máx. 500). Usar códigos únicos y verificación de email.
* **Ganar Crolars**: subir apuntes de calidad (curado), ganar desafíos, posiciones en liga, misiones.
* **Gasto de Crolars**: tienda oficial, cursos seleccionados, apuntes de pago. Marketplace de terceros **sin Crolars** por defecto (bandera futura `allow_crolars` a nivel producto y política global).
* **Anti‑abuso**: límites diarios, verificación, auditoría en `CrolarsLedger`, detección de fraude (IP, bots, repetición).

---

## 6) Niveles, ranking y participación

* **Nivel/XP** por: respuestas útiles (foro), apuntes valorados, ganar desafíos, partidos de liga. El feed **no suma** puntos (solo reputación visual).
* **Ranking** (ponderaciones iniciales): 40% apuntes (views\*calidad), 40% foro (respuestas aceptadas y votos), 20% actividad (misiones/ligas/desafíos). Generar `RankingSnapshot` semanal y mensual.
* **Estadística de participación** en perfil: gráfico por día (últimos 30) con % de actividad respecto a su propio máximo diario.

---

## 7) Búsqueda y filtrado

* Búsqueda global con tabs: Todo, Apuntes, Personas, Clubes, Foro, Cursos, Tienda.
* Filtros por carrera, etiquetas, fecha, popularidad.

---

## 8) Moderación y verificación

* **Reportes** desde menú de tres puntos. Cola para moderadores (cambiar estado, notas internas).
* **Verificación** de cuentas y de vendedores (badge).
* **Política de contenido**: prohibir spam, plagio, contenido no educativo o ilegal.

---

## 9) Notificaciones

* Tipos: menciones, respuestas, mejor respuesta, compras, envíos, nuevos eventos, invitaciones a clubes, resultados de liga, fin de desafío, racha disponible, Crolars ganados, recordatorios de curso.
* Ajustes por tipo. Entrega **in‑app**, **email** y (opcional) **web push**.

---

## 10) Accesibilidad, i18n y SEO

* **A11y**: navegación teclado, roles ARIA, contraste.
* **i18n**: ES‑PE por defecto, preparar llaves para otros idiomas.
* **SEO**: metatags OG/Twitter, mapa del sitio, rutas legibles.

---

## 11) Entregables mínimos

1. **Repo monorepo** con apps `web` (Next.js) y `api` (Nest/Express), `packages/ui`, `packages/config`.
2. **Esquema Prisma** y **migraciones**. Script de **seed** (usuarios demo, cursos, clubes, productos, retos).
3. **.env.example** con todas las claves/URLs (S3/R2, DB, Redis, Resend, Auth, Stripe/Culqi).
4. **Swagger/OpenAPI** publicado en `/api/docs`.
5. **Catálogo de componentes** (shadcn/ui) y tokens de tema morado‑azulado claro.
6. **Colección Postman** y **tests** (unitarios + E2E básicos).
7. **Panel admin** básico: moderación, métricas, catálogo tienda oficial, snapshots de ranking, payouts.

---

## 12) Rutas y estructura (sugerida)

* Web (Next App Router):

  * `/login`, `/register`, `/forgot`, `/verify`
  * `/` (Feed)
  * `/notes` (Apuntes), `/notes/:id`
  * `/forum` (Foro), `/forum/question/:id`
  * `/market` (Tienda), `/market/product/:id`, `/cart`, `/orders`
  * `/courses`, `/courses/:id`
  * `/clubs`, `/clubs/:id`
  * `/events`
  * `/career` (Mi carrera)
  * `/league`, `/challenges`
  * `/profile/:username` (vista pública) y `/me` (vista privada)
  * `/settings` (tabs: perfil, tienda, verificación, notifs, tema, legal)
  * `/notifications`
  * `/personal-space`
  * `/crunebot` (desactivado)
  * `/plus` (Crunevo+)

---

## 13) Endpoints API (resumen)

* **Auth**: `/auth/register`, `/auth/login`, `/auth/forgot`, `/auth/reset`, `/auth/verify`.
* **Feed**: `/posts [GET/POST]`, `/posts/:id [GET/DELETE/PATCH]`, `/posts/:id/react`, `/posts/:id/share`.
* **Foro**: `/questions`, `/questions/:id`, `/questions/:id/answers`, `/answers/:id/vote`, `/questions/:id/accept/:answerId`.
* **Apuntes**: `/notes`, `/notes/:id`, `/notes/:id/view`, `/notes/:id/purchase`, subida S3 firmado.
* **Tienda**: `/products`, `/products/:id`, `/cart`, `/orders`, `/orders/:id`, `/payouts`.
* **Cursos**: `/courses`, `/courses/:id`, `/courses/:id/lessons`, `/enrollments`.
* **Clubes**: `/clubs`, `/clubs/:id`, `/clubs/:id/join`, `/clubs/:id/posts`.
* **Eventos**: `/events`, `/events/:id`, `/events/:id/rsvp`.
* **Liga**: `/league`, `/league/teams`, `/league/matches`, `/league/score`.
* **Desafíos**: `/challenges`, `/challenges/:id`, `/challenges/:id/vote`.
* **Perfil**: `/users/:username`, `/me`.
* **Crolars**: `/crolars/balance`, `/crolars/claim-streak`, `/crolars/refer`, `/crolars/withdraw`.
* **Notifs**: `/notifications`, `/notifications/read`.
* **Buscador**: `/search?q=` con `type`.
* **Admin**: `/admin/*` moderación, snapshots, oficiales, métricas.

Incluye **paginación**, filtros, validación Zod, y errores JSON consistentes.

---

## 14) Componentes UI clave

* **Composer** de publicaciones con tres botones: **Pregunta (Foro)**, **Foto**, **Apunte**.
* **Tarjeta de feed** con: autor, tiempo, texto, media, 🔥, comentar, compartir, menú 3 puntos.
* **Tarjeta de apunte** con preview, precio (si aplica), guardar, ver detalle.
* **Visor de documentos**: paginación, zoom, descargar, comentarios.
* **Pregunta/respuesta** con votos ↑/↓ y badge de “Mejor respuesta”.
* **Carrito** con resumen y pasos de compra.
* **Ranking** con medallas, filtros por carrera/período.
* **Perfil** dual (toggle “Ver como público”).
* **Drawer** de menú tipo Facebook con secciones indicadas.
* **CruneBot card**: estado “Desactivado” + FAQs rápidas.
* **Espacio Personal**: canvas con bloques (grid opcional), toggles Editar/Completar.

---

## 15) Mejoras propuestas (además de lo pedido)

* **Indexado y anti‑plagio** en apuntes (hash de archivos, detección de duplicados básicos).
* **Sistema de etiquetas** (subjects/cursos) transversal para feed, foro, apuntes y cursos.
* **Sugerencias personalizadas** por carrera e intereses.
* **Editor enriquecido** (markdown/mentions/@) para posts y foro.
* **Historial de revisiones** en preguntas y apuntes.
* **Política de retiradas de Crolars** con KYC ligero si fuera a dinero real.
* **Centro de ayuda** con tickets y FAQ.
* **Atajos**: `N` nueva nota, `Q` nueva pregunta, `U` subir apunte, `F` buscar, `G` ir a (feed/foro/apuntes…).
* **Modo offline** limitado para leer apuntes ya cargados (PWA opcional).

---

## 16) Seguridad, privacidad y cumplimiento

* Rate limiting por IP y usuario; protección anti‑fuerza bruta; bloqueo temporal.
* Sanitizar HTML y bloquear scripts en contenido de usuario.
* Permisos RBAC (student/mod/admin). Acciones admin auditadas.
* Retención y borrado de datos conforme a políticas (resumen en Privacidad).

---

## 17) Plan de entregas (fases sugeridas)

1. **F0—Fundaciones**: Auth, perfiles, navbar/drawer, tema, DB.
2. **F1—Feed + Notifs**: publicaciones, reacciones, guardar, notifs básicas.
3. **F2—Foro + Apuntes**: preguntas/respuestas, votos, visor y subida de documentos.
4. **F3—Marketplace + Carrito**: productos, oficial Crunevo, pedidos.
5. **F4—Cursos + Clubes + Eventos**.
6. **F5—Liga + Desafíos + Ranking + Gamificación (Crolars/racha/referidos)**.
7. **F6—Espacio Personal + CruneBot (placeholder)**.
8. **F7—Admin + Moderación + Búsqueda + SEO + A11y + Tests/E2E**.

Cada fase debe cerrar con **seed**, **tests** y **demo**.

---

## 18) Criterios de aceptación (muestras)

* Puedo **registrarme**, verificarme por email (Resend) e **iniciar sesión**.
* En el **feed**, publico texto/foto/apunte o **pregunta al foro** desde el mismo composer.
* En **apuntes**, subo un PDF y lo **veo** con paginación y comentarios.
* En el **foro**, publico pregunta, recibo **respuestas**, **voto** y **marco mejor respuesta**.
* En **tienda**, agrego al **carrito**, compro (simulado), y veo mi historial.
* Reclamo mi **racha** del día y se registra en `CrolarsLedger`.
* En **perfil**, alterno **vista pública/privada** y veo **mis compras** solo en privada.
* En **Espacio Personal**, arrastro bloques en **Editar** y quedan fijos en **Completar**.
* El **centro de notificaciones** muestra y filtra eventos de módulo.

---

## 19) Semilla de datos (seed) requerida

* 10 carreras (incluye Ingeniería).
* 30 usuarios demo (algunos verificados, algunos vendedores oficiales).
* 20 apuntes (mixtos por carrera).
* 15 preguntas foro con 30 respuestas.
* 8 clubes (con banners).
* 10 cursos (con 3–6 lecciones).
* 15 productos (5 oficiales).
* 6 eventos futuros.
* 1 liga con 4 equipos y 3 rondas.
* 6 desafíos activos.

---

## 20) Instrucciones explícitas para ti (IA de código)

1. **No uses claves reales**; usa variables de entorno y `.env.example`.
2. Prioriza **claridad y mantenibilidad** sobre “hacks”. Componentiza.
3. Implementa **tests** mínimos por módulo y **Playwright** para flujos críticos.
4. Escribe **README** con setup local (Docker compose opcional para DB/Redis).
5. Genera **migraciones** y pruébalas con datos seed.
6. Entrega **capturas** o un storybook simple de los principales componentes.
7. Mantén coherencia con la **paleta morado‑azulada clara** y los **iconos** definidos (🔥 like; monos 🙈/🙉 en login).
8. Donde se pida “desactivado” (CruneBot), implementa UI y lógica de placeholder.
9. Evita dependencias innecesarias; justifica las críticas.
10. Documenta dónde cambiar **políticas** (p. ej., permitir Crolars en marketplace externo).

---

### Nota sobre nombres

* Usa **“Crunevo”** de forma consistente en la UI. (Variantes previas: Cruneo/Crunebo).
* Moneda: **Crolars** (alias “crollars”).

---

> **Resultado esperado:** Un repositorio ejecutable con la app web de Crunevo funcional en el alcance descrito, con seeds, panel admin básico, OpenAPI, pruebas mínimas y un diseño limpio y accesible que respete la identidad morado‑azulada clara.
