import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingWizard } from '@/components/booking/booking-wizard';

export const metadata: Metadata = {
  title: 'New Booking | Joey Moves Pro',
  description: 'Book a new move',
};

export default async function NewBookingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book a Move</h1>
        <p className="text-gray-600 mt-2">
          Fill out the details below to get an instant quote and book your move
        </p>
      </div>

      {/* Booking Wizard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <BookingWizard user={session.user} />
      </div>
    </div>
  );
}