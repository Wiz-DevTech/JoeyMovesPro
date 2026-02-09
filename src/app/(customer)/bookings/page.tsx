import { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/customer/job-card';
import { JobsFilter } from '@/components/customer/jobs-filter';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Bookings | Joey Moves Pro',
  description: 'View and manage your moving bookings',
};

interface BookingsPageProps {
  searchParams: {
    status?: string;
    sort?: string;
  };
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  // Build query filters
  const statusFilter = searchParams.status
    ? { status: searchParams.status }
    : {};

  const sortOrder =
    searchParams.sort === 'oldest'
      ? { scheduledDate: 'asc' as const }
      : { scheduledDate: 'desc' as const };

  // Fetch jobs
  const jobs = await prisma.job.findMany({
    where: {
      customerId: session.user.id,
      ...statusFilter,
    },
    include: {
      pricing: true,
      driver: {
        select: {
          id: true,
          name: true,
          phone: true,
          image: true,
        },
      },
      invoice: {
        select: {
          status: true,
          depositPaid: true,
          finalPaid: true,
        },
      },
    },
    orderBy: sortOrder,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage all your moving jobs</p>
        </div>

        <Link href="/bookings/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <JobsFilter currentStatus={searchParams.status} currentSort={searchParams.sort} />

      {/* Jobs List */}
      <Suspense fallback={<JobsListSkeleton />}>
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {searchParams.status
                ? `No bookings with status "${searchParams.status}"`
                : "You haven't made any bookings yet"}
            </p>
            <Link href="/bookings/new">
              <Button>Create Your First Booking</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="h-10 bg-gray-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}