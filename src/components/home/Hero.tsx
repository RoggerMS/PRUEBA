import { ArrowRight, Users, BookOpen, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Conecta con tu
          <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            Comunidad Estudiantil
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
          La plataforma social diseñada para estudiantes universitarios. 
          Comparte conocimientos, conecta con compañeros y construye tu red académica.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/feed"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Explorar Feed
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/auth/register"
            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-2"
          >
            Únete Ahora
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-4 rounded-full mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">10,000+</h3>
            <p className="text-blue-100">Estudiantes Conectados</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-4 rounded-full mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">50,000+</h3>
            <p className="text-blue-100">Recursos Compartidos</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-4 rounded-full mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">100,000+</h3>
            <p className="text-blue-100">Conversaciones Activas</p>
          </div>
        </div>
      </div>
    </section>
  );
}
