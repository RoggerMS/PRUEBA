-- Insertar categorías de ejemplo
INSERT INTO "Category" (id, name, description, "createdAt", "updatedAt") VALUES
('cat_1', 'Tecnología', 'Clubes relacionados con tecnología, programación y ciencias de la computación', NOW(), NOW()),
('cat_2', 'Deportes', 'Clubes deportivos y actividades físicas', NOW(), NOW()),
('cat_3', 'Arte y Cultura', 'Clubes de arte, música, teatro y expresión cultural', NOW(), NOW()),
('cat_4', 'Ciencias', 'Clubes de ciencias naturales, matemáticas y investigación', NOW(), NOW()),
('cat_5', 'Idiomas', 'Clubes para practicar y aprender idiomas', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar materias de ejemplo
INSERT INTO "Subject" (id, name, "categoryId", "createdAt", "updatedAt") VALUES
('subj_1', 'Programación', 'cat_1', NOW(), NOW()),
('subj_2', 'Inteligencia Artificial', 'cat_1', NOW(), NOW()),
('subj_3', 'Desarrollo Web', 'cat_1', NOW(), NOW()),
('subj_4', 'Fútbol', 'cat_2', NOW(), NOW()),
('subj_5', 'Baloncesto', 'cat_2', NOW(), NOW()),
('subj_6', 'Natación', 'cat_2', NOW(), NOW()),
('subj_7', 'Pintura', 'cat_3', NOW(), NOW()),
('subj_8', 'Música', 'cat_3', NOW(), NOW()),
('subj_9', 'Teatro', 'cat_3', NOW(), NOW()),
('subj_10', 'Física', 'cat_4', NOW(), NOW()),
('subj_11', 'Química', 'cat_4', NOW(), NOW()),
('subj_12', 'Matemáticas', 'cat_4', NOW(), NOW()),
('subj_13', 'Inglés', 'cat_5', NOW(), NOW()),
('subj_14', 'Francés', 'cat_5', NOW(), NOW()),
('subj_15', 'Alemán', 'cat_5', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar clubes de ejemplo
INSERT INTO "Club" (id, name, description, "categoryId", "subjectId", level, location, rules, visibility, "memberLimit", "createdAt", "updatedAt") VALUES
('club_1', 'Desarrolladores JavaScript', 'Club para aprender y compartir conocimientos sobre JavaScript, React, Node.js y tecnologías web modernas.', 'cat_1', 'subj_3', 'INTERMEDIATE', 'Aula 201, Edificio de Informática', 'Respeto mutuo, participación activa, compartir conocimientos', 'PUBLIC', 50, NOW(), NOW()),
('club_2', 'IA y Machine Learning', 'Exploramos el fascinante mundo de la inteligencia artificial y el aprendizaje automático.', 'cat_1', 'subj_2', 'ADVANCED', 'Laboratorio de IA, Piso 3', 'Conocimientos básicos de programación requeridos', 'PUBLIC', 30, NOW(), NOW()),
('club_3', 'Fútbol Universitario', 'Club oficial de fútbol de la universidad. Entrenamientos regulares y competencias.', 'cat_2', 'subj_4', 'BEGINNER', 'Campo de fútbol principal', 'Compromiso con entrenamientos, fair play', 'PUBLIC', 25, NOW(), NOW()),
('club_4', 'Arte Digital', 'Creamos arte usando herramientas digitales, desde ilustración hasta animación 3D.', 'cat_3', 'subj_7', 'INTERMEDIATE', 'Laboratorio de Arte Digital', 'Creatividad y respeto por el trabajo de otros', 'PUBLIC', 20, NOW(), NOW()),
('club_5', 'Física Cuántica', 'Estudiamos los misterios de la mecánica cuántica y sus aplicaciones.', 'cat_4', 'subj_10', 'ADVANCED', 'Aula de Física Avanzada', 'Conocimientos de cálculo y física básica', 'PRIVATE', 15, NOW(), NOW()),
('club_6', 'English Conversation', 'Practica tu inglés en un ambiente relajado y divertido.', 'cat_5', 'subj_13', 'INTERMEDIATE', 'Sala de Idiomas 105', 'Solo inglés durante las sesiones', 'PUBLIC', 40, NOW(), NOW()),
('club_7', 'Programación Competitiva', 'Preparación para concursos de programación y algoritmos.', 'cat_1', 'subj_1', 'ADVANCED', 'Laboratorio de Programación', 'Dedicación y práctica constante', 'PUBLIC', 20, NOW(), NOW()),
('club_8', 'Banda Universitaria', 'La banda oficial de la universidad. Tocamos en eventos y ceremonias.', 'cat_3', 'subj_8', 'INTERMEDIATE', 'Sala de Música', 'Saber tocar al menos un instrumento', 'PUBLIC', 35, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar algunos posts de ejemplo
INSERT INTO "ClubPost" (id, title, content, "authorId", "clubId", "createdAt", "updatedAt") VALUES
('post_1', '¡Bienvenidos al Club de JavaScript!', 'Hola a todos! Estamos emocionados de tener este espacio para compartir conocimientos sobre JavaScript. Próximamente organizaremos talleres sobre React y Node.js.', 'user_1', 'club_1', NOW(), NOW()),
('post_2', 'Taller de Machine Learning - Próximo Viernes', 'El próximo viernes tendremos un taller introductorio sobre redes neuronales. Traigan sus laptops!', 'user_2', 'club_2', NOW(), NOW()),
('post_3', 'Entrenamiento de Fútbol - Martes y Jueves', 'Recordatorio: entrenamientos los martes y jueves a las 4:00 PM en el campo principal.', 'user_3', 'club_3', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar algunos eventos de ejemplo
INSERT INTO "ClubEvent" (id, title, description, "startDate", "endDate", location, "maxAttendees", "clubId", "createdAt", "updatedAt") VALUES
('event_1', 'Hackathon JavaScript 2024', 'Hackathon de 24 horas para crear aplicaciones web innovadoras usando JavaScript.', '2024-02-15 09:00:00', '2024-02-16 09:00:00', 'Auditorio Principal', 100, 'club_1', NOW(), NOW()),
('event_2', 'Conferencia de IA', 'Conferencia sobre los últimos avances en inteligencia artificial.', '2024-02-20 14:00:00', '2024-02-20 18:00:00', 'Sala de Conferencias', 50, 'club_2', NOW(), NOW()),
('event_3', 'Torneo de Fútbol Inter-Clubes', 'Torneo amistoso entre diferentes clubes deportivos.', '2024-02-25 10:00:00', '2024-02-25 16:00:00', 'Campo de Fútbol', 200, 'club_3', NOW(), NOW()),
('event_4', 'Exposición de Arte Digital', 'Muestra de los mejores trabajos creados por los miembros del club.', '2024-03-01 10:00:00', '2024-03-01 20:00:00', 'Galería de Arte', 80, 'club_4', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Nota: Los miembros de clubes se agregarán cuando los usuarios se registren y se unan a los clubes
-- a través de la interfaz de la aplicación.