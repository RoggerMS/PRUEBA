import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 p-4 rounded-full">
            <Sparkles className="w-12 h-12" />
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para transformar tu
          <span className="block">experiencia universitaria?</span>
        </h2>
        
        <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
          Únete a miles de estudiantes que ya están conectando, aprendiendo y 
          creciendo juntos en nuestra plataforma.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/auth/register" 
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Crear Cuenta Gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link 
            href="/feed" 
            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
          >
            Explorar Contenido
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold mb-2">100% Gratis</p>
            <p className="text-blue-100">Sin costos ocultos</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-2">24/7 Disponible</p>
            <p className="text-blue-100">Acceso completo</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-2">Comunidad Global</p>
            <p className="text-blue-100">Estudiantes de todo el mundo</p>
          </div>
        </div>
      </div>
    </section>
  );
}