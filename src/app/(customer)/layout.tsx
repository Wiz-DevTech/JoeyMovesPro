import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CustomerNav } from '@/components/customer/customer-nav';
import { Sidebar } from '@/components/shared/sidebar';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Only customers can access this area
  if (session.user.role !== 'CUSTOMER') {
    if (session.user.role === 'DRIVER') {
      redirect('/driver/dashboard');
    } else if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      redirect('/admin/operations');
    } else {
      redirect('/');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <CustomerNav user={session.user} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar role="customer" />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}