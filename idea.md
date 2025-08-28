# PROMPT PARA UNA IA QUE ESCRIBE CÃ“DIGO

**Rol que debes adoptar:** Arquitecto/a de software y desarrollador/a fullâ€‘stack senior. Eres responsable de diseÃ±ar, implementar y documentar **CRUNEVO**, una **red social educativa** para universidad, con economÃ­a virtual llamada **Crolars** (tambiÃ©n escrito â€œcrollarsâ€), un **marketplace**, **cursos**, **apuntes** (subida/visualizaciÃ³n de documentos), **foro tipo Brainly**, **clubes**, **eventos**, **ranking**, **liga acadÃ©mica**, **desafÃ­os**, **chat**, **notificaciones**, un **perfil con vista privada/pÃºblica** y un **â€œWORKSPACEâ€** (pizarra editable con bloques arrastrables). Incluye **CruneBot** (chat de IA desactivado por ahora) y futura suscripciÃ³n **Crunevo+**.

> **Objetivo**: Entregar una aplicaciÃ³n web moderna, segura, accesible y responsive, lista para demo en producciÃ³n, con semilla de datos y panel de administraciÃ³n bÃ¡sico.

---

## 0) Pistas de arquitectura y stack sugerido (puedes proponer mejoras justificadas)

* **Frontend**: Next.js 14 (App Router, RSC) + TypeScript, Tailwind CSS + shadcn/ui, React Query, Zustand para estado ligero. Iconos: Lucide, Bootstrap Icons cuando se especifique (p. ej., â€œfuegoâ€ para reacciones).
* **Backend**: Node.js (NestJS o Express) + TypeScript. ValidaciÃ³n con Zod o classâ€‘validator.
* **DB**: PostgreSQL con Prisma ORM.
* **Cache/colas**: Redis (rate limiting, sesiones, colas BullMQ para emails, notifs, generaciÃ³n de previews de docs).
* **Storage**: S3/R2 para archivos (apuntes, imÃ¡genes, banners). Miniaturas y previews generadas en workers.
* **Tiempo real**: WebSockets (Socket.IO) o SSE para notificaciones/chat/estado del tablero del WORKSPACE.
* **Email**: Resend (confirmaciÃ³n, reset, notifs).
* **Auth**: Auth.js/NextAuth o Clerk (email/usuario+password; 2FA opcional). Sesiones JWT con rotaciÃ³n de tokens.
* **Pagos reales (opcional demo)**: Stripe o Culqi (PerÃº). Abstraer capa de pagos.
* **BÃºsqueda**: PostgreSQL fullâ€‘text inicialmente; interfaz preparada para Elastic u OpenSearch.
* **Infra**: Monorepo (turborepo). Deploy en Vercel + Fly/DigitalOcean/Render para backend/colas si separas.
* **Docs**: OpenAPI/Swagger (backend), Storybook opcional para UI.
* **Calidad**: ESLint, Prettier, Husky + lintâ€‘staged, Vitest/Jest + Playwright para E2E.
* **Accesibilidad**: WCAG 2.2 AA (focus states, roles ARIA, contraste, navegaciÃ³n por teclado).
* **Seguridad**: CSRF, CORS, CSP estricta, Helmet, sanitizaciÃ³n HTML, subida con antivirus opcional (ClamAV), lÃ­mites de tamaÃ±o (
  p. ej., 50 MB por archivo). AuditorÃ­a y logs estructurados.

> Si eliges otro stack, mantÃ©n equivalentes funcionales y explica por quÃ©.

---

## 1) Identidad visual y UX global

* **Tema**: Paleta **moradoâ€‘azulado muy claro** (tendiendo a blanco). Barra superior (Navbar) con gradiente suave moradoâ†’azulado pÃ¡lido.
* **TipografÃ­a**: Sistema o Inter.
* **Layout**: En feed, **panel izquierdo** (navegaciÃ³n, accesos rÃ¡pidos, tendencias) y **panel derecho** (sugerencias, anuncios, widgets). Contenido central con tarjetas minimalistas sin marcos duros (glass/soft shadow).
* **BotÃ³n acciÃ³n flotante** â€œ+â€ (abajoâ€‘derecha) con menÃº: **Nota rÃ¡pida**, **Atajos de teclado**, **CruneBot**.
* **Reacciones**: El â€œme gustaâ€ es **ðŸ”¥** (fuego), ademÃ¡s comentar y compartir. MenÃº de tres puntos: **Guardar**, **Copiar enlace**, **No me interesa**, **Denunciar**.
* **Responsive**: MÃ³vil prioritario (Navbar superior condensada; menÃº lateral en drawer).

---

## 2) MÃ³dulos y pÃ¡ginas principales

### 2.1 AutenticaciÃ³n y Onboarding

* **Login** (estilo inspirado en Facebook, pero propio): fondo **morado muy claro**, formulario con **correo o usuario** + **contraseÃ±a**. El toggle de contraseÃ±a NO es ojo: usa **dos iconos de mono** (ðŸ™ˆ cubrir/ðŸ™‰ mostrar).
* **Registro**: nombre, apellidos, **nombre de usuario**, correo, contraseÃ±a, fecha de nacimiento, **gÃ©nero** (mujer/hombre/personalizado), check de **aceptaciÃ³n de TÃ©rminos y Condiciones**. Texto legal bajo el botÃ³n. VerificaciÃ³n por email (Resend).
* **Recuperar contraseÃ±a** por email.

### 2.2 Feed (Inicio)

* **Tipos de publicaciÃ³n**: (a) **Pregunta directa al foro**; (b) **Subir foto**; (c) **Subir apunte/documento**; (d) texto normal.
* **Contenido mostrado**: preguntas, publicaciones normales, **apuntes relevantes**.
* **Accesos rÃ¡pidos** en panel izquierdo: Subir apunte, Hacer pregunta, Publicar.
* **Tendencias**: hashtags, preguntas destacadas, mejores apuntes.
* **Racha semanal**: widget para **reclamar Crolars** (ver reglas en Â§5).

### 2.3 Apuntes (Documentos)

* Subida de **Word, PPT, Excel, PDF, imÃ¡genes, txt**. Metadatos: tÃ­tulo, descripciÃ³n, etiquetas, carrera, curso, opcional **precio en Crolars** (si creador quiere monetizar).
* Vista de galerÃ­a con **preview**; tarjeta con: tÃ­tulo, miniatura, autor, mÃ©tricas, menÃº.
* **Visor** interno tipo PDF: paginaciÃ³n (â†/â†’), zoom, **descargar**, **solicitar impresiÃ³n** (simulado), comentarios, valoraciones.

### 2.4 Foro estudiantil (tipo Brainly)

* Publicar **preguntas** (tÃ­tulo+detalle+tags).
* **Respuestas** con votos â†‘/â†“, comentarios, **marcar â€œMejor respuestaâ€** por autor/a de la pregunta.
* Sistema de **puntos/experiencia** por participaciÃ³n (ver Â§6 Niveles/Ranking).

### 2.5 Marketplace (Tienda)

* **Marketplace abierto** (cualquiera compra/vende). Filtros: categorÃ­a, precio, estado, vendedor, â€œ**Oficial Crunevo**â€.
* **Etiqueta** â€œOficial Crunevoâ€ para productos del **store oficial**.
* **Carrito** para ver seleccionados y compras previas.
* **Crolars**: inicialmente **solo vÃ¡lidos en la tienda oficial** (ver Â§5). Dejar bandera para permitir Crolars en vendedores externos en el futuro.

### 2.6 Cursos

* Listado de cursos (video), detalle con lecciones, progreso, valoraciones.
* Algunos cursos pueden requerir Crolars o suscripciÃ³n **Crunevo+**.

### 2.7 Clubes (tipo grupos Facebook/Reddit)

* Crear/editar **club**: nombre, descripciÃ³n, **banner/portada** y **avatar**.
* Publicaciones internas, reglas, moderaciÃ³n, solicitud de ingreso, roles (admin/moderador/miembro).

### 2.8 Eventos

* Calendario/lista de **eventos universitarios**. InscripciÃ³n/Interesado, recordatorios.

### 2.9 â€œMi carreraâ€

* Al registrarse, el usuario elige su **carrera** â†’ se crea secciÃ³n â€œ**Mi carrera**â€ con feed, apuntes, cursos, clubes, eventos y **chat** de la carrera.
* **Destacados**: placeholder con tarjetas de contenido recomendado por carrera (curaciÃ³n simple por ahora: p. ej., mÃ¡s guardados/visitados de esa carrera).

### 2.10 Liga acadÃ©mica (torneos)

* Equipos de estudiantes responden retos por rondas, **tabla de posiciones**, **medallas/insignias** para Top 3 y **recompensas**.

### 2.11 DesafÃ­os (enseÃ±ar a otros)

* Creadores publican miniâ€‘lecciones/retos, la comunidad **vota** al mejor â€œprofesorâ€. Recompensas y visibilidad.

### 2.12 CruneBot (IA)

* Chat **desactivado** por ahora. Mostrar **preguntas rÃ¡pidas** con respuestas genÃ©ricas:

  * Â¿CÃ³mo funciona Crunevo?
  * Â¿CÃ³mo ganar Crolars?
  * Â¿CÃ³mo funcionan los clubes?
  * Â¿CÃ³mo subir apuntes?
* Preparar **proveedor abstracto** para integrar OpenAI u otra IA en el futuro.

### 2.13 WORKSPACE (Personal Space)

* **Pizarra inmensa** con **bloques** arrastrables: Notas, Tareas, Kanban, Objetivos, Calendario, GrÃ¡fico, Cita/Frase, etc.
* **Modo EdiciÃ³n**: permite arrastrar/soltar y redimensionar; **Modo Completar**: persiste posiciones y desactiva ediciÃ³n.
* BotÃ³n flotante â€œ+â€ de la app crea **Nota rÃ¡pida** aquÃ­.

### 2.14 Perfil

* **Dos vistas**: **Privada (yo)** y **PÃºblica (como me ven)**.
* Tabs personales: Publicaciones, **Apuntes**, **Logros**, **Misiones**, **Compras** (solo privada), **Referidos**.
* Si no hay publicaciones: mostrar â€œCrea tu primera publicaciÃ³nâ€.

### 2.15 Notificaciones

* Centro unificado: feed, apuntes, foro, tienda, cursos, clubes, eventos, liga, desafÃ­os, rachas, Crolars. Filtrar por tipo, marcar como leÃ­do, preferencias. Tiempo real.

### 2.16 ConfiguraciÃ³n

* Perfil: nombre de usuario, bio, foto, **info acadÃ©mica** (carrera), intereses.
* **Tienda**: mostrar tienda pÃºblica, verificaciÃ³n de vendedor.
* **VerificaciÃ³n de cuenta** (badges).
* **Tema** claro/oscuro.
* **Notificaciones** granular.
* **Crunevo+** (suscripciÃ³n) estado/planes.
* **Centro de ayuda y legal**: TÃ©rminos, Privacidad, Cookies. Texto base:

  * **TÃ©rminos**: â€œCrunevo es una plataforma educativa peruana dedicada a conectar estudiantes mediante intercambio de apuntes, recursos, foros de ayuda, tiendas estudiantiles y herramientas de inteligencia artificial.â€ Completar con licencias, limitaciones, reglas de conducta y uso de contenido.
  * **Privacidad**: minimizaciÃ³n de datos, fines educativos, seguridad, derechos ARCO, contacto soporte.
  * **Cookies**: manager con consentimiento granular.

---

## 3) NavegaciÃ³n y menÃºs

* **Navbar** superior con logo y buscador global. A la derecha: Ã­cono de notificaciones, botÃ³n â€œ+â€ (opcional duplicado en desktop), **menÃº estilo Facebook** que abre **drawer** con: **Mi perfil**, **WORKSPACE**, **Misiones**, **Liga**, **DesafÃ­os**, **Eventos**, **Ajustes**, **CruneBot** (desactivado). Puedes aÃ±adir â€œAyudaâ€ y â€œSoporteâ€.
* **Sidebar izquierda** en Inicio: Inicio, Mi perfil, Mi WORKSPACE, Apuntes, Foro, Clubes, Eventos, Cursos, Tienda, Misiones, Ranking, IA/CruneBot, **Tendencias**, **Accesos rÃ¡pidos**.
* **Footer**: â€œÂ© 2025 Crunevo â€” Construyendo el Futuro Educativo â€¢ Sobre Crunevo â€¢ Cookies â€¢ Privacidad â€¢ TÃ©rminosâ€.

---

## 4) Modelo de datos (mÃ­nimo)

> Usa nombres en inglÃ©s en DB, pero conserva marcas en UI en espaÃ±ol.

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

### 4.6 GamificaciÃ³n y organizaciÃ³n

* `RankingSnapshot(id, period[weekly|monthly], metrics_json, created_at)`
* `Mission(id, title, description, reward_crolars)` â€¢ `UserMission(user_id, mission_id, status)`
* `Challenge(id, title, description, career_major_id?, starts_at, ends_at)` â€¢ `ChallengeVote(challenge_id, voter_id, target_user_id, score)`
* `League(id, season, rules)` â€¢ `LeagueTeam(id, league_id, name, captain_id)` â€¢ `LeagueMatch(id, league_id, round, team_a_id, team_b_id, score_a, score_b)`

### 4.7 ComunicaciÃ³n y notificaciones

* `Conversation(id, title?, is_group_bool, career_major_id?)` â€¢ `ConversationMember(conversation_id, user_id)` â€¢ `Message(id, conversation_id, sender_id, body, attachments[])`
* `Notification(id, user_id, type, payload_json, read_at, created_at)`

---

## 5) Reglas de negocio (Crolars, rachas, referidos)

* **ConversiÃ³n**: **5,000 Crolars = 5 soles** (mÃ­nimo de retiro). Mantener en constantes y en tabla de parÃ¡metros.
* **Racha semanal** (7 dÃ­as, se reinicia cada semana):

  * DÃ­a 1: **1** Crolar, DÃ­a 2: **2**, DÃ­a 3: **3**, DÃ­a 4: **4**, DÃ­a 5: **5**, DÃ­a 6: **7**, DÃ­a 7: **10**.
  * Un botÃ³n en el feed permite **reclamar** el dÃ­a correspondiente; validar dÃ­as consecutivos.
* **Referidos**: **100 Crolars por persona** hasta **5 referidos** (mÃ¡x. 500). Usar cÃ³digos Ãºnicos y verificaciÃ³n de email.
* **Ganar Crolars**: subir apuntes de calidad (curado), ganar desafÃ­os, posiciones en liga, misiones.
* **Gasto de Crolars**: tienda oficial, cursos seleccionados, apuntes de pago. Marketplace de terceros **sin Crolars** por defecto (bandera futura `allow_crolars` a nivel producto y polÃ­tica global).
* **Antiâ€‘abuso**: lÃ­mites diarios, verificaciÃ³n, auditorÃ­a en `CrolarsLedger`, detecciÃ³n de fraude (IP, bots, repeticiÃ³n).

---

## 6) Niveles, ranking y participaciÃ³n

* **Nivel/XP** por: respuestas Ãºtiles (foro), apuntes valorados, ganar desafÃ­os, partidos de liga. El feed **no suma** puntos (solo reputaciÃ³n visual).
* **Ranking** (ponderaciones iniciales): 40% apuntes (views\*calidad), 40% foro (respuestas aceptadas y votos), 20% actividad (misiones/ligas/desafÃ­os). Generar `RankingSnapshot` semanal y mensual.
* **EstadÃ­stica de participaciÃ³n** en perfil: grÃ¡fico por dÃ­a (Ãºltimos 30) con % de actividad respecto a su propio mÃ¡ximo diario.

---

## 7) BÃºsqueda y filtrado

* BÃºsqueda global con tabs: Todo, Apuntes, Personas, Clubes, Foro, Cursos, Tienda.
* Filtros por carrera, etiquetas, fecha, popularidad.

---

## 8) ModeraciÃ³n y verificaciÃ³n

* **Reportes** desde menÃº de tres puntos. Cola para moderadores (cambiar estado, notas internas).
* **VerificaciÃ³n** de cuentas y de vendedores (badge).
* **PolÃ­tica de contenido**: prohibir spam, plagio, contenido no educativo o ilegal.

---

## 9) Notificaciones

* Tipos: menciones, respuestas, mejor respuesta, compras, envÃ­os, nuevos eventos, invitaciones a clubes, resultados de liga, fin de desafÃ­o, racha disponible, Crolars ganados, recordatorios de curso.
* Ajustes por tipo. Entrega **inâ€‘app**, **email** y (opcional) **web push**.

---

## 10) Accesibilidad, i18n y SEO

* **A11y**: navegaciÃ³n teclado, roles ARIA, contraste.
* **i18n**: ESâ€‘PE por defecto, preparar llaves para otros idiomas.
* **SEO**: metatags OG/Twitter, mapa del sitio, rutas legibles.

---

## 11) Entregables mÃ­nimos

1. **Repo monorepo** con apps `web` (Next.js) y `api` (Nest/Express), `packages/ui`, `packages/config`.
2. **Esquema Prisma** y **migraciones**. Script de **seed** (usuarios demo, cursos, clubes, productos, retos).
3. **.env.example** con todas las claves/URLs (S3/R2, DB, Redis, Resend, Auth, Stripe/Culqi).
4. **Swagger/OpenAPI** publicado en `/api/docs`.
5. **CatÃ¡logo de componentes** (shadcn/ui) y tokens de tema moradoâ€‘azulado claro.
6. **ColecciÃ³n Postman** y **tests** (unitarios + E2E bÃ¡sicos).
7. **Panel admin** bÃ¡sico: moderaciÃ³n, mÃ©tricas, catÃ¡logo tienda oficial, snapshots de ranking, payouts.

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
  * `/profile/:username` (vista pÃºblica) y `/me` (vista privada)
  * `/settings` (tabs: perfil, tienda, verificaciÃ³n, notifs, tema, legal)
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
* **DesafÃ­os**: `/challenges`, `/challenges/:id`, `/challenges/:id/vote`.
* **Perfil**: `/users/:username`, `/me`.
* **Crolars**: `/crolars/balance`, `/crolars/claim-streak`, `/crolars/refer`, `/crolars/withdraw`.
* **Notifs**: `/notifications`, `/notifications/read`.
* **Buscador**: `/search?q=` con `type`.
* **Admin**: `/admin/*` moderaciÃ³n, snapshots, oficiales, mÃ©tricas.

Incluye **paginaciÃ³n**, filtros, validaciÃ³n Zod, y errores JSON consistentes.

---

## 14) Componentes UI clave

* **Composer** de publicaciones con tres botones: **Pregunta (Foro)**, **Foto**, **Apunte**.
* **Tarjeta de feed** con: autor, tiempo, texto, media, ðŸ”¥, comentar, compartir, menÃº 3 puntos.
* **Tarjeta de apunte** con preview, precio (si aplica), guardar, ver detalle.
* **Visor de documentos**: paginaciÃ³n, zoom, descargar, comentarios.
* **Pregunta/respuesta** con votos â†‘/â†“ y badge de â€œMejor respuestaâ€.
* **Carrito** con resumen y pasos de compra.
* **Ranking** con medallas, filtros por carrera/perÃ­odo.
* **Perfil** dual (toggle â€œVer como pÃºblicoâ€).
* **Drawer** de menÃº tipo Facebook con secciones indicadas.
* **CruneBot card**: estado â€œDesactivadoâ€ + FAQs rÃ¡pidas.
* **WORKSPACE**: canvas con bloques (grid opcional), toggles Editar/Completar.

---

## 15) Mejoras propuestas (ademÃ¡s de lo pedido)

* **Indexado y antiâ€‘plagio** en apuntes (hash de archivos, detecciÃ³n de duplicados bÃ¡sicos).
* **Sistema de etiquetas** (subjects/cursos) transversal para feed, foro, apuntes y cursos.
* **Sugerencias personalizadas** por carrera e intereses.
* **Editor enriquecido** (markdown/mentions/@) para posts y foro.
* **Historial de revisiones** en preguntas y apuntes.
* **PolÃ­tica de retiradas de Crolars** con KYC ligero si fuera a dinero real.
* **Centro de ayuda** con tickets y FAQ.
* **Atajos**: `N` nueva nota, `Q` nueva pregunta, `U` subir apunte, `F` buscar, `G` ir a (feed/foro/apuntesâ€¦).
* **Modo offline** limitado para leer apuntes ya cargados (PWA opcional).

---

## 16) Seguridad, privacidad y cumplimiento

* Rate limiting por IP y usuario; protecciÃ³n antiâ€‘fuerza bruta; bloqueo temporal.
* Sanitizar HTML y bloquear scripts en contenido de usuario.
* Permisos RBAC (student/mod/admin). Acciones admin auditadas.
* RetenciÃ³n y borrado de datos conforme a polÃ­ticas (resumen en Privacidad).

---

## 17) Plan de entregas (fases sugeridas)

1. **F0â€”Fundaciones**: Auth, perfiles, navbar/drawer, tema, DB.
2. **F1â€”Feed + Notifs**: publicaciones, reacciones, guardar, notifs bÃ¡sicas.
3. **F2â€”Foro + Apuntes**: preguntas/respuestas, votos, visor y subida de documentos.
4. **F3â€”Marketplace + Carrito**: productos, oficial Crunevo, pedidos.
5. **F4â€”Cursos + Clubes + Eventos**.
6. **F5â€”Liga + DesafÃ­os + Ranking + GamificaciÃ³n (Crolars/racha/referidos)**.
7. **F6â€”WORKSPACE + CruneBot (placeholder)**.
8. **F7â€”Admin + ModeraciÃ³n + BÃºsqueda + SEO + A11y + Tests/E2E**.

Cada fase debe cerrar con **seed**, **tests** y **demo**.

---

## 18) Criterios de aceptaciÃ³n (muestras)

* Puedo **registrarme**, verificarme por email (Resend) e **iniciar sesiÃ³n**.
* En el **feed**, publico texto/foto/apunte o **pregunta al foro** desde el mismo composer.
* En **apuntes**, subo un PDF y lo **veo** con paginaciÃ³n y comentarios.
* En el **foro**, publico pregunta, recibo **respuestas**, **voto** y **marco mejor respuesta**.
* En **tienda**, agrego al **carrito**, compro (simulado), y veo mi historial.
* Reclamo mi **racha** del dÃ­a y se registra en `CrolarsLedger`.
* En **perfil**, alterno **vista pÃºblica/privada** y veo **mis compras** solo en privada.
* En **WORKSPACE**, arrastro bloques en **Editar** y quedan fijos en **Completar**.
* El **centro de notificaciones** muestra y filtra eventos de mÃ³dulo.

---

## 19) Semilla de datos (seed) requerida

* 10 carreras (incluye IngenierÃ­a).
* 30 usuarios demo (algunos verificados, algunos vendedores oficiales).
* 20 apuntes (mixtos por carrera).
* 15 preguntas foro con 30 respuestas.
* 8 clubes (con banners).
* 10 cursos (con 3â€“6 lecciones).
* 15 productos (5 oficiales).
* 6 eventos futuros.
* 1 liga con 4 equipos y 3 rondas.
* 6 desafÃ­os activos.

---

## 20) Instrucciones explÃ­citas para ti (IA de cÃ³digo)

1. **No uses claves reales**; usa variables de entorno y `.env.example`.
2. Prioriza **claridad y mantenibilidad** sobre â€œhacksâ€. Componentiza.
3. Implementa **tests** mÃ­nimos por mÃ³dulo y **Playwright** para flujos crÃ­ticos.
4. Escribe **README** con setup local (Docker compose opcional para DB/Redis).
5. Genera **migraciones** y pruÃ©balas con datos seed.
6. Entrega **capturas** o un storybook simple de los principales componentes.
7. MantÃ©n coherencia con la **paleta moradoâ€‘azulada clara** y los **iconos** definidos (ðŸ”¥ like; monos ðŸ™ˆ/ðŸ™‰ en login).
8. Donde se pida â€œdesactivadoâ€ (CruneBot), implementa UI y lÃ³gica de placeholder.
9. Evita dependencias innecesarias; justifica las crÃ­ticas.
10. Documenta dÃ³nde cambiar **polÃ­ticas** (p. ej., permitir Crolars en marketplace externo).

---

### Nota sobre nombres

* Usa **â€œCrunevoâ€** de forma consistente en la UI. (Variantes previas: Cruneo/Crunebo).
* Moneda: **Crolars** (alias â€œcrollarsâ€).

---

> **Resultado esperado:** Un repositorio ejecutable con la app web de Crunevo funcional en el alcance descrito, con seeds, panel admin bÃ¡sico, OpenAPI, pruebas mÃ­nimas y un diseÃ±o limpio y accesible que respete la identidad moradoâ€‘azulada clara.

