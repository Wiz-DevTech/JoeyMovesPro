import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendInvoiceEmail } from '@/lib/helpers/send-email';

// GET /api/invoices - List invoices
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const role = session.user.role;

    let invoices;

    if (role === 'CUSTOMER') {
      invoices = await prisma.invoice.findMany({
        where: {
          job: {
            customerId: session.user.id,
          },
          ...(status && { status }),
        },
        include: {
          job: {
            select: {
              jobNumber: true,
              pickupAddress: true,
              dropoffAddress: true,
              completedAt: true,
            },
          },
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      invoices = await prisma.invoice.findMany({
        where: status ? { status } : {},
        include: {
          job: {
            select: {
              jobNumber: true,
              customerName: true,
              customerEmail: true,
              pickupAddress: true,
              dropoffAddress: true,
              completedAt: true,
            },
          },
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST /api/invoices/:id/send - Send invoice email
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    // Fetch invoice with job details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        job: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Send email
    await sendInvoiceEmail({
      to: invoice.job.customer.email,
      customerName: invoice.job.customer.name || 'Valued Customer',
      jobNumber: invoice.job.jobNumber,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.total,
      depositPaid: invoice.depositAmount,
      finalAmount: invoice.finalAmount,
      invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`,
      pickupAddress: invoice.job.pickupAddress,
      dropoffAddress: invoice.job.dropoffAddress,
      completedDate: invoice.job.completedAt?.toLocaleDateString() || 'N/A',
    });

    // Update invoice as sent
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}