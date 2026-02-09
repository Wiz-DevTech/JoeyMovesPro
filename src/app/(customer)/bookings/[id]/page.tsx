import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { JobHeader } from '@/components/customer/job-header';
import { JobDetails } from '@/components/customer/job-details';
import { JobTimeline } from '@/components/customer/job-timeline';
import { LiveTracking } from '@/components/customer/live-tracking';
import { InvoiceSection } from '@/components/customer/invoice-section';
import { ChatWidget } from '@/components/chat/chat-widget';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { jobNumber: true },
  });

  return {
    title: job ? `Job #${job.jobNumber} | Joey Moves Pro` : 'Job Not Found',
    description: 'View job details and track your move',
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch job with all relations
  const job = await prisma.job.findUnique({
    where: {
      id: params.id,
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
          image: true,
          driverProfile: {
            select: {
              rating: true,
              completedJobs: true,
              currentLat: true,
              currentLng: true,
              currentStatus: true,
            },
          },
        },
      },
      pricing: true,
      invoice: {
        include: {
          payments: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      locations: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!job) {
    notFound();
  }

  // Verify ownership
  if (job.customerId !== session.user.id) {
    redirect('/bookings');
  }

  const isActiveJob = ['HEADING_TO_PICKUP', 'AT_PICKUP', 'LOADING', 'IN_TRANSIT', 'AT_DROPOFF', 'UNLOADING'].includes(job.status);

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <JobHeader job={job} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Tracking (only for active jobs) */}
          {isActiveJob && job.driver && (
            <LiveTracking
              job={job}
              driver={job.driver}
              latestLocation={job.locations[0]}
            />
          )}

          {/* Job Details */}
          <JobDetails job={job} />

          {/* Timeline */}
          <JobTimeline statusHistory={job.statusHistory} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Invoice Section */}
          {job.invoice && (
            <InvoiceSection
              invoice={job.invoice}
              jobId={job.id}
              jobNumber={job.jobNumber}
            />
          )}

          {/* Driver Info (if assigned) */}
          {job.driver && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Driver</h3>
              <div className="flex items-center space-x-3">
                {job.driver.image ? (
                  <img
                    src={job.driver.image}
                    alt={job.driver.name || 'Driver'}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {job.driver.name?.charAt(0) || 'D'}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{job.driver.name}</div>
                  {job.driver.driverProfile && (
                    <div className="text-sm text-gray-600">
                      ⭐ {job.driver.driverProfile.rating.toFixed(1)} • {job.driver.driverProfile.completedJobs} moves
                    </div>
                  )}
                </div>
              </div>
              {job.driver.phone && (
                <a
                  href={`tel:${job.driver.phone}`}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Driver
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Widget (Floating) */}
      <ChatWidget jobId={job.id} userId={session.user.id} userRole={session.user.role} />
    </div>
  );
}