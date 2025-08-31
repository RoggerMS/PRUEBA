import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clubs/categories - Obtener categorías de clubes con estadísticas
export async function GET(request: NextRequest) {
  try {
    // Obtener todas las categorías únicas con conteo de clubes
    const categoriesWithCount = await prisma.club.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      _sum: {
        memberCount: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    
    // Obtener estadísticas adicionales por categoría
    const categoriesWithStats = await Promise.all(
      categoriesWithCount.map(async (cat) => {
        // Obtener clubes más populares de esta categoría
        const topClubs = await prisma.club.findMany({
          where: { category: cat.category },
          select: {
            id: true,
            name: true,
            avatar: true,
            memberCount: true,
            isPrivate: true
          },
          orderBy: { memberCount: 'desc' },
          take: 3
        });
        
        // Obtener actividad reciente (posts de la última semana)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const recentActivity = await prisma.clubPost.count({
          where: {
            club: {
              category: cat.category
            },
            createdAt: {
              gte: weekAgo
            }
          }
        });
        
        return {
          name: cat.category,
          clubCount: cat._count.category,
          totalMembers: cat._sum.memberCount || 0,
          averageMembers: cat._sum.memberCount && cat._count.category 
            ? Math.round((cat._sum.memberCount || 0) / cat._count.category)
            : 0,
          recentActivity,
          topClubs,
          // Generar descripción basada en la categoría
          description: getCategoryDescription(cat.category),
          // Generar icono/emoji basado en la categoría
          icon: getCategoryIcon(cat.category)
        };
      })
    );
    
    // Estadísticas generales
    const totalStats = await prisma.club.aggregate({
      _count: {
        id: true
      },
      _sum: {
        memberCount: true
      },
      _avg: {
        memberCount: true
      }
    });
    
    const totalCategories = categoriesWithCount.length;
    const mostPopularCategory = categoriesWithCount[0];
    
    return NextResponse.json({
      categories: categoriesWithStats,
      stats: {
        totalClubs: totalStats._count.id || 0,
        totalMembers: totalStats._sum.memberCount || 0,
        averageMembers: Math.round(totalStats._avg.memberCount || 0),
        totalCategories,
        mostPopularCategory: mostPopularCategory ? {
          name: mostPopularCategory.category,
          clubCount: mostPopularCategory._count.category
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error fetching club categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener descripción de categoría
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'Tecnología': 'Clubes enfocados en programación, desarrollo, IA y nuevas tecnologías',
    'Deportes': 'Clubes deportivos y de actividades físicas',
    'Arte': 'Clubes de arte, diseño, música y expresión creativa',
    'Ciencia': 'Clubes de investigación, experimentos y divulgación científica',
    'Literatura': 'Clubes de lectura, escritura y literatura',
    'Música': 'Clubes de música, bandas y apreciación musical',
    'Gaming': 'Clubes de videojuegos y deportes electrónicos',
    'Fotografía': 'Clubes de fotografía y artes visuales',
    'Cocina': 'Clubes de cocina, gastronomía y cultura culinaria',
    'Viajes': 'Clubes de viajes, turismo y exploración',
    'Negocios': 'Clubes de emprendimiento, negocios y desarrollo profesional',
    'Idiomas': 'Clubes de intercambio de idiomas y culturas',
    'Salud': 'Clubes de bienestar, fitness y vida saludable',
    'Medio Ambiente': 'Clubes de sostenibilidad y cuidado ambiental',
    'Voluntariado': 'Clubes de servicio comunitario y voluntariado',
    'Filosofía': 'Clubes de debate filosófico y reflexión',
    'Historia': 'Clubes de historia y patrimonio cultural',
    'Matemáticas': 'Clubes de matemáticas y lógica',
    'Psicología': 'Clubes de psicología y desarrollo personal',
    'Otros': 'Clubes de diversas temáticas e intereses'
  };
  
  return descriptions[category] || `Clubes relacionados con ${category.toLowerCase()}`;
}

// Función auxiliar para obtener icono de categoría
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Tecnología': '💻',
    'Deportes': '⚽',
    'Arte': '🎨',
    'Ciencia': '🔬',
    'Literatura': '📚',
    'Música': '🎵',
    'Gaming': '🎮',
    'Fotografía': '📸',
    'Cocina': '👨‍🍳',
    'Viajes': '✈️',
    'Negocios': '💼',
    'Idiomas': '🌍',
    'Salud': '💪',
    'Medio Ambiente': '🌱',
    'Voluntariado': '🤝',
    'Filosofía': '🤔',
    'Historia': '🏛️',
    'Matemáticas': '📐',
    'Psicología': '🧠',
    'Otros': '🌟'
  };
  
  return icons[category] || '📋';
}