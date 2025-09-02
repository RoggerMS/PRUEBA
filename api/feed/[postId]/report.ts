import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
  description: z.string().optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { postId } = req.query;
  
  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ error: 'ID de post requerido' });
  }

  try {
    const validation = reportSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validation.error.errors
      });
    }

    const { reason, description } = validation.data;

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Verificar si ya reportó este post
    const existingReport = await prisma.report.findFirst({
      where: {
        postId: postId,
        reporterId: session.user.id
      }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'Ya has reportado este post' });
    }

    // Crear el reporte
    const report = await prisma.report.create({
      data: {
        postId: postId,
        reporterId: session.user.id,
        reason: reason,
        description: description,
        status: 'pending'
      }
    });

    // Notificar a los moderadores (opcional)
    const moderators = await prisma.user.findMany({
      where: {
        role: { in: ['MODERATOR', 'ADMIN'] }
      },
      select: { id: true }
    });

    // Crear notificaciones para moderadores
    if (moderators.length > 0) {
      await prisma.notification.createMany({
        data: moderators.map(mod => ({
          type: 'report',
          recipientId: mod.id,
          actorId: session.user.id,
          message: `Nuevo reporte: ${reason}`,
          metadata: JSON.stringify({ 
            postId: postId,
            reportId: report.id,
            reason: reason
          })
        }))
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Reporte enviado exitosamente',
      reportId: report.id
    });
  } catch (error) {
    console.error('Error in report API:', error);
    return res.status(500).json({ error: 'Error interno del