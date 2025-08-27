import { Share2, Users, BookOpen, MessageSquare, Trophy, Shield } from 'lucide-react';

const features = [
  {
    icon: Share2,
    title: "Comparte Contenido",
    description: "Publica texto, imágenes, videos y documentos. Comparte tus conocimientos y experiencias con la comunidad estudiantil."
  },
  {
    icon: Users,
    title: "Conecta con Estudiantes",
    description: "Encuentra compañeros de tu carrera, únete a grupos de estudio y construye tu red académica y profesional."
  },
  {
    icon: BookOpen,
    title: "Recursos Académicos",
    description: "Accede a apuntes, guías de estudio, trabajos de investigación y materiales compartidos por otros estudiantes."
  },
  {
    icon: MessageSquare,
    title: "Discusiones Académicas",
    description: "Participa en debates, haz preguntas, resuelve dudas y colabora en proyectos con estudiantes de todo el mundo."
  },
  {
    icon: Trophy,
    title: "Sistema de Logros",
    description: "Gana puntos y insignias por tu participación activa. Destaca como colaborador valioso en la comunidad."
  },
  {
    icon: Shield,
    title: "Entorno Seguro",
    description: "Plataforma moderada y segura, diseñada específicamente para el ambiente académico universitario."
  }
];

export default function Features() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Todo lo que necesitas para
            <span className="block text-blue-600">tu vida universitaria</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una plataforma completa diseñada para potenciar tu experiencia académica 
            y conectarte con una comunidad global de estudiantes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}