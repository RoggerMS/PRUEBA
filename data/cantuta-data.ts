// Datos específicos de la Universidad Nacional de Educación Enrique Guzmán y Valle (La Cantuta)

export interface Faculty {
  id: string
  name: string
  programs: Program[]
}

export interface Program {
  id: string
  name: string
  facultyId: string
}

export const CANTUTA_FACULTIES: Faculty[] = [
  {
    id: 'agropecuaria-nutricion',
    name: 'Facultad de Agropecuaria y Nutrición',
    programs: [
      { id: 'agropecuaria', name: 'Agropecuaria', facultyId: 'agropecuaria-nutricion' },
      { id: 'desarrollo-ambiental', name: 'Desarrollo Ambiental', facultyId: 'agropecuaria-nutricion' },
      { id: 'industria-alimentaria-nutricion', name: 'Industria Alimentaria y Nutrición', facultyId: 'agropecuaria-nutricion' },
      { id: 'nutricion-humana', name: 'Nutrición Humana', facultyId: 'agropecuaria-nutricion' }
    ]
  },
  {
    id: 'ciencias',
    name: 'Facultad de Ciencias',
    programs: [
      { id: 'biologia-ciencias-naturales', name: 'Biología – Ciencias Naturales', facultyId: 'ciencias' },
      { id: 'biologia-informatica', name: 'Biología – Informática', facultyId: 'ciencias' },
      { id: 'fisica-matematica', name: 'Física – Matemática', facultyId: 'ciencias' },
      { id: 'informatica', name: 'Informática', facultyId: 'ciencias' },
      { id: 'matematica', name: 'Matemática', facultyId: 'ciencias' },
      { id: 'matematica-informatica', name: 'Matemática e Informática', facultyId: 'ciencias' },
      { id: 'quimica-ciencias-naturales', name: 'Química – Ciencias Naturales', facultyId: 'ciencias' },
      { id: 'quimica-fisica-biologia', name: 'Química – Física y Biología', facultyId: 'ciencias' }
    ]
  },
  {
    id: 'ciencias-empresariales',
    name: 'Facultad de Ciencias Empresariales (sede Rímac)',
    programs: [
      { id: 'administracion-empresas', name: 'Administración de Empresas', facultyId: 'ciencias-empresariales' },
      { id: 'administracion-negocios-internacionales', name: 'Administración de Negocios Internacionales', facultyId: 'ciencias-empresariales' },
      { id: 'gastronomia', name: 'Gastronomía', facultyId: 'ciencias-empresariales' },
      { id: 'turismo-hoteleria', name: 'Turismo y Hotelería', facultyId: 'ciencias-empresariales' }
    ]
  },
  {
    id: 'ciencias-sociales-humanidades',
    name: 'Facultad de Ciencias Sociales y Humanidades',
    programs: [
      { id: 'educacion-artistica-artes-plasticas', name: 'Educación Artística: Artes Plásticas', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'educacion-artistica-teatro', name: 'Educación Artística: Teatro', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'educacion-artistica-musica', name: 'Educación Artística: Música', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'educacion-intercultural-bilingue', name: 'Educación Intercultural Bilingüe (Lengua Española, Literatura)', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'filosofia-geografia-historia', name: 'Filosofía, Geografía, Historia', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'idiomas-ingles-frances', name: 'Idiomas Combinados: Inglés–Francés', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'idiomas-ingles-italiano', name: 'Idiomas Combinados: Inglés–Italiano', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'idiomas-ingles-aleman', name: 'Idiomas Combinados: Inglés–Alemán', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'idiomas-espanol-ingles', name: 'Idiomas Combinados: Lengua Española–Inglés', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'idiomas-literatura-espanol', name: 'Idiomas Combinados: Literatura–Lengua Española', facultyId: 'ciencias-sociales-humanidades' },
      { id: 'psicologia', name: 'Psicología', facultyId: 'ciencias-sociales-humanidades' }
    ]
  },
  {
    id: 'educacion-inicial',
    name: 'Facultad de Educación Inicial',
    programs: [
      { id: 'educacion-inicial', name: 'Educación Inicial', facultyId: 'educacion-inicial' }
    ]
  },
  {
    id: 'pedagogia-cultura-fisica',
    name: 'Facultad de Pedagogía y Cultura Física',
    programs: [
      { id: 'educacion-basica-alternativa', name: 'Educación Básica Alternativa (especial)', facultyId: 'pedagogia-cultura-fisica' },
      { id: 'educacion-fisica', name: 'Educación Física', facultyId: 'pedagogia-cultura-fisica' },
      { id: 'educacion-primaria', name: 'Educación Primaria', facultyId: 'pedagogia-cultura-fisica' }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Facultad de Tecnología',
    programs: [
      { id: 'artes-industriales', name: 'Artes Industriales', facultyId: 'tecnologia' },
      { id: 'automatizacion-industrial', name: 'Automatización Industrial', facultyId: 'tecnologia' },
      { id: 'construccion-civil', name: 'Construcción Civil', facultyId: 'tecnologia' },
      { id: 'construcciones-metalicas', name: 'Construcciones Metálicas', facultyId: 'tecnologia' },
      { id: 'diseno-arquitectonico-industrial', name: 'Diseño Arquitectónico e Industrial', facultyId: 'tecnologia' },
      { id: 'ebanisteria-decoracion', name: 'Ebanistería y Decoración', facultyId: 'tecnologia' },
      { id: 'electricidad', name: 'Electricidad', facultyId: 'tecnologia' },
      { id: 'electronica-informatica', name: 'Electrónica e Informática', facultyId: 'tecnologia' },
      { id: 'fuerza-motriz', name: 'Fuerza Motriz', facultyId: 'tecnologia' },
      { id: 'mecanica-produccion', name: 'Mecánica de Producción', facultyId: 'tecnologia' },
      { id: 'metalurgia', name: 'Metalurgia', facultyId: 'tecnologia' },
      { id: 'soldadura-industrial', name: 'Soldadura Industrial', facultyId: 'tecnologia' },
      { id: 'tecnologia-vestido', name: 'Tecnología del Vestido', facultyId: 'tecnologia' },
      { id: 'tecnologia-textil', name: 'Tecnología Textil', facultyId: 'tecnologia' },
      { id: 'telecomunicaciones', name: 'Telecomunicaciones', facultyId: 'tecnologia' }
    ]
  }
]

// Ciudades principales del Perú para el selector de ubicación
export const PERU_CITIES = [
  'Lima',
  'Arequipa',
  'Trujillo',
  'Chiclayo',
  'Piura',
  'Iquitos',
  'Cusco',
  'Chimbote',
  'Huancayo',
  'Tacna',
  'Ica',
  'Pucallpa',
  'Cajamarca',
  'Sullana',
  'Ayacucho',
  'Chincha Alta',
  'Juliaca',
  'Huánuco',
  'Tarapoto',
  'Puno',
  'Tumbes',
  'Talara',
  'Jaén',
  'Chosica',
  'Callao'
]

// Función helper para obtener programas por facultad
export const getProgramsByFaculty = (facultyId: string): Program[] => {
  const faculty = CANTUTA_FACULTIES.find(f => f.id === facultyId)
  return faculty ? faculty.programs : []
}

// Función helper para obtener facultad por programa
export const getFacultyByProgram = (programId: string): Faculty | undefined => {
  return CANTUTA_FACULTIES.find(faculty => 
    faculty.programs.some(program => program.id === programId)
  )
}

// Función helper para validar combinación facultad-programa
export const isValidFacultyProgramCombination = (facultyId: string, programId: string): boolean => {
  const faculty = CANTUTA_FACULTIES.find(f => f.id === facultyId)
  if (!faculty) return false
  return faculty.programs.some(program => program.id === programId)
}
