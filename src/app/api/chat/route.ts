import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'od';

const chatMessageSchema = z.object({
  jobId: z.string().optional(),
  message: z.string().min(1).max(500),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
});

// GET /api/chat?jobId=xxx - Get chat history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Verify user has access to this job
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        OR: [
          { customerId: session.user.id },
          { driverId: session.user.id },
          { customer: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } },
        ],
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Fetch chat messages
    const messages = await prisma.chatMessage.findMany({
      where: { jobId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/chat - Send message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, message, messageType } = chatMessageSchema.parse(body);

    // Verify access if jobId provided
    if (jobId) {
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          OR: [
            { customerId: session.user.id },
            { driverId: session.user.id },
          ],
        },
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
    }

    // Create message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        jobId: jobId || null,
        senderId: session.user.id,
        senderRole: session.user.role,
        message,
        messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // TODO: Send WebSocket notification to other participants
    // TODO: If AI support enabled, trigger AI response

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Send chat message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}