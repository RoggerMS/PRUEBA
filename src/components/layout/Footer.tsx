import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-crunevo-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>©2025 Crunevo — Construyendo el Futuro Educativo</span>
              <Heart className="w-4 h-4 text-fire fill-current" />
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-crunevo-600 transition-colors"
              >
                Sobre
              </Link>
              <Link 
                href="/legal/cookies" 
                className="text-gray-600 hover:text-crunevo-600 transition-colors"
              >
                Cookies
              </Link>
              <Link 
                href="/legal/privacy" 
                className="text-gray-600 hover:text-crunevo-600 transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                href="/legal/terms" 
                className="text-gray-600 hover:text-crunevo-600 transition-colors"
              >
                Términos
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-crunevo-100">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-xs text-gray-500">
              <p>
                Plataforma educativa peruana que conecta estudiantes mediante apuntes, recursos, foros y herramientas de IA.
              </p>
              <div className="flex items-center space-x-4">
                <span>Versión 1.0.0</span>
                <span>•</span>
                <Link 
                  href="/support" 
                  className="hover:text-crunevo-600 transition-colors"
                >
                  Soporte
                </Link>
                <span>•</span>
                <Link 
                  href="/contact" 
                  className="hover:text-crunevo-600 transition-colors"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
