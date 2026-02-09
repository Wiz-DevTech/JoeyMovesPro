import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FleetMap } from '@/components/fleet/fleet-map';
import { DriversList } from '@/components/admin/drivers-list';

export const metadata: Metadata = {
  title: 'Fleet Management | Joey Moves Pro',
  description: 'Monitor and manage your driver fleet',
};

export default async function FleetPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login');
  }

  // Fetch all drivers with their profiles and current jobs
  const drivers = await prisma.user.findMany({
    where: {
      role: 'DRIVER',
      isActive: true,
    },
    include: {
      driverProfile: true,
      driverJobs: {
        where: {
          status: {
            in: ['HEADING_TO_PICKUP', 'AT_PICKUP', 'LOADING', 'IN_TRANSIT', 'AT_DROPOFF', 'UNLOADING'],
          },
        },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Format drivers for map
  const driversForMap = drivers
    .filter((d) => d.driverProfile?.currentLat && d.driverProfile?.currentLng)
    .map((driver) => ({
      id: driver.id,
      name: driver.name || 'Unknown',
      lat: driver.driverProfile!.currentLat!,
      lng: driver.driverProfile!.currentLng!,
      status: driver.driverProfile!.currentStatus,
      currentJob: driver.driverJobs[0]
        ? {
            id: driver.driverJobs[0].id,
            pickupLat: driver.driverJobs[0].pickupLat!,
            pickupLng: driver.driverJobs[0].pickupLng!,
            dropoffLat: driver.driverJobs[0].dropoffLat!,
            dropoffLng: driver.driverJobs[0].dropoffLng!,
          }
        : undefined,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
        <p className="text-gray-600 mt-2">Real-time driver locations and status</p>
      </div>

      {/* Map View */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-[600px]">
          <FleetMap drivers={driversForMap} />
        </div>
      </div>

      {/* Drivers List */}
      <DriversList drivers={drivers} />
    </div>
  );
}