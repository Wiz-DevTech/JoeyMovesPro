import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { OperationsBoard } from '@/components/admin/operations-board';

export const metadata: Metadata = {
  title: 'Operations | Joey Moves Pro',
  description: 'Manage all moving jobs',
};

export default async function OperationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login');
  }

  // Fetch all jobs grouped by status
  const jobs = await prisma.job.findMany({
    where: {
      status: {
        notIn: ['COMPLETED', 'CANCELLED'],
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          driverProfile: {
            select: {
              rating: true,
              currentStatus: true,
            },
          },
        },
      },
      pricing: true,
      invoice: {
        select: {
          status: true,
          depositPaid: true,
        },
      },
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });

  // Fetch available drivers
  const availableDrivers = await prisma.user.findMany({
    where: {
      role: 'DRIVER',
      isActive: true,
      driverProfile: {
        currentStatus: {
          in: ['AVAILABLE', 'OFFLINE'],
        },
      },
    },
    include: {
      driverProfile: {
        select: {
          rating: true,
          completedJobs: true,
          currentStatus: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Operations Board</h1>
        <p className="text-gray-600 mt-2">Manage and assign jobs to drivers</p>
      </div>

      {/* Operations Board (Kanban) */}
      <OperationsBoard jobs={jobs} drivers={availableDrivers} />
    </div>
  );
}