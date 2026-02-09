import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { StatsCards } from '@/components/customer/stats-cards';
import { UpcomingJobs } from '@/components/customer/upcoming-jobs';
import { RecentInvoices } from '@/components/customer/recent-invoices';
import { QuickActions } from '@/components/customer/quick-actions';

export const metadata: Metadata = {
  title: 'Dashboard | Joey Moves Pro',
  description: 'Your moving dashboard',
};

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  // Fetch dashboard data
  const [jobs, invoices, stats] = await Promise.all([
    // Upcoming jobs
    prisma.job.findMany({
      where: {
        customerId: session.user.id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'SCHEDULED'],
        },
      },
      include: {
        pricing: true,
        driver: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
      take: 5,
    }),

    // Recent invoices
    prisma.invoice.findMany({
      where: {
        job: {
          customerId: session.user.id,
        },
      },
      include: {
        job: {
          select: {
            jobNumber: true,
            pickupAddress: true,
            dropoffAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),

    // Stats
    prisma.job.aggregate({
      where: {
        customerId: session.user.id,
      },
      _count: true,
      _sum: {
        actualTotal: true,
      },
    }),
  ]);

  const totalMoves = stats._count;
  const totalSpent = stats._sum.actualTotal || 0;
  const upcomingMoves = jobs.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your moves</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Cards */}
      <StatsCards
        totalMoves={totalMoves}
        upcomingMoves={upcomingMoves}
        totalSpent={totalSpent}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Jobs */}
        <div className="lg:col-span-1">
          <UpcomingJobs jobs={jobs} />
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-1">
          <RecentInvoices invoices={invoices} />
        </div>
      </div>
    </div>
  );
}