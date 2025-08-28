import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'trae-api-us.mchost.guru'],
  },
  // Optimizaciones para reducir el tamaño del bundle
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion', 'react-hook-form'],
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Configuración de compilación optimizada
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  // Configuración de bundle analyzer
  productionBrowserSourceMaps: false,
  // Optimización de chunks
  swcMinify: true,
  // Configuración de webpack optimizada
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Optimizaciones para reducir el tamaño del bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
      };
      
      // Optimización de chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000,
            },
          },
        },
      };
    }
    
    // Tree shaking para módulos no utilizados
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    return config;
  },
  // Configuración de output para Vercel
  output: 'standalone',
  // Compresión
  compress: true,

  // Configuración de rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;