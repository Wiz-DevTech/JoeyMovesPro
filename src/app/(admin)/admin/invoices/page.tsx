import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { InvoicesTable } from '@/components/admin/invoices-table';
import { InvoiceStats } from '@/components/admin/invoice-stats';

export const metadata: Metadata = {
  title: 'Invoices | Joey Moves Pro',
  description: 'Manage customer invoices and payments',
};

interface InvoicesPageProps {
  searchParams: {
    status?: string;
    sort?: string;
  };
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login');
  }

  // Build filters
  const statusFilter = searchParams.status ? { status: searchParams.status } : {};

  // Fetch invoices
  const [invoices, stats] = await Promise.all([
    prisma.invoice.findMany({
      where: statusFilter,
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
      take: 50,
    }),

    // Calculate stats
    prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
      _count: {
        status: true,
      },
      where: {
        status: {
          in: ['SENT', 'VIEWED', 'PARTIAL'],
        },
      },
    }),
  ]);

  const totalRevenue = await prisma.invoice.aggregate({
    _sum: {
      total: true,
    },
    where: {
      status: 'PAID',
    },
  });

  const pendingAmount = stats._sum.total || 0;
  const paidAmount = totalRevenue._sum.total || 0;
  const unpaidCount = stats._count.status;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-2">Manage customer invoices and track payments</p>
      </div>

      {/* Stats */}
      <InvoiceStats
        totalRevenue={paidAmount}
        pendingAmount={pendingAmount}
        unpaidCount={unpaidCount}
      />

      {/* Invoices Table */}
      <InvoicesTable
        invoices={invoices}
        currentStatus={searchParams.status}
        currentSort={searchParams.sort}
      />
    </div>
  );
}