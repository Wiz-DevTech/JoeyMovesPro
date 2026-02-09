import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { CurrentJob } from '@/components/driver/current-job';
import { TodaysJobs } from '@/components/driver/todays-jobs';
import { DriverStats } from '@/components/driver/driver-stats';
import { AvailabilityToggle } from '@/components/driver/availability-toggle';

export const metadata: Metadata = {
  title: 'Driver Dashboard | Joey Moves Pro',
  description: 'Manage your jobs and availability',
};

export default async function DriverDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'DRIVER') {
    redirect('/login');
  }

  // Fetch driver profile and stats
  const [driverProfile, currentJob, todaysJobs, stats] = await Promise.all([
    prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
    }),

    // Current active job
    prisma.job.findFirst({
      where: {
        driverId: session.user.id,
        status: {
          in: ['HEADING_TO_PICKUP', 'AT_PICKUP', 'LOADING', 'IN_TRANSIT', 'AT_DROPOFF', 'UNLOADING'],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        pricing: true,
      },
    }),

    // Today's scheduled jobs
    prisma.job.findMany({
      where: {
        driverId: session.user.id,
        scheduledDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        pricing: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    }),

    // Driver stats
    prisma.job.aggregate({
      where: {
        driverId: session.user.id,
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      _count: true,
      _sum: {
        actualTotal: true,
      },
    }),
  ]);

  const totalEarnings = driverProfile?.totalEarnings || 0;
  const completedJobs = driverProfile?.completedJobs || 0;
  const rating = driverProfile?.rating || 5.0;
  const monthlyJobs = stats._count;
  const monthlyEarnings = stats._sum.actualTotal || 0;

  return (
    <div className="space-y-8">
      {/* Header with Availability Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your jobs and track earnings</p>
        </div>
        <AvailabilityToggle
          currentStatus={driverProfile?.currentStatus || 'OFFLINE'}
          driverId={session.user.id}
        />
      </div>

      {/* Stats Cards */}
      <DriverStats
        totalEarnings={totalEarnings}
        completedJobs={completedJobs}
        rating={rating}
        monthlyJobs={monthlyJobs}
        monthlyEarnings={monthlyEarnings}
      />

      {/* Current Job (if any) */}
      {currentJob && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Current Job</h2>
          <CurrentJob job={currentJob} />
        </div>
      )}

      {/* Today's Jobs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
        <TodaysJobs jobs={todaysJobs} currentJobId={currentJob?.id} />
      </div>
    </div>
  );
}