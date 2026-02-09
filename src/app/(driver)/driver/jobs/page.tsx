import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailableJobCard } from '@/components/driver/available-job-card';
import { CompletedJobCard } from '@/components/driver/completed-job-card';

export const metadata: Metadata = {
  title: 'Jobs | Joey Moves Pro',
  description: 'View available and completed jobs',
};

export default async function DriverJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'DRIVER') {
    redirect('/login');
  }

  // Fetch available jobs (unassigned or assigned to this driver)
  const [availableJobs, assignedJobs, completedJobs] = await Promise.all([
    // Available jobs (not assigned)
    prisma.job.findMany({
      where: {
        driverId: null,
        status: {
          in: ['CONFIRMED', 'SCHEDULED'],
        },
        scheduledDate: {
          gte: new Date(),
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
        scheduledDate: 'asc',
      },
      take: 20,
    }),

    // Jobs assigned to this driver
    prisma.job.findMany({
      where: {
        driverId: session.user.id,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
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
      orderBy: {
        scheduledDate: 'asc',
      },
    }),

    // Completed jobs
    prisma.job.findMany({
      where: {
        driverId: session.user.id,
        status: 'COMPLETED',
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        pricing: {
          select: {
            totalActual: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-600 mt-2">Browse available jobs and view your history</p>
      </div>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned">
            My Jobs ({assignedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-6">
          {assignedJobs.length === 0 ? (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned jobs</h3>
              <p className="text-gray-600">Check the Available tab for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignedJobs.map((job) => (
                <AvailableJobCard key={job.id} job={job} isAssigned />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {availableJobs.length === 0 ? (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No available jobs</h3>
              <p className="text-gray-600">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableJobs.map((job) => (
                <AvailableJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedJobs.length === 0 ? (
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed jobs yet</h3>
              <p className="text-gray-600">Your completed jobs will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {completedJobs.map((job) => (
                <CompletedJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}