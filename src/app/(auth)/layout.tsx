import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if already logged in
  if (session) {
    const role = session.user.role;
    
    if (role === 'DRIVER') {
      redirect('/driver/dashboard');
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      redirect('/admin/operations');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">Joey Moves Pro</h1>
          <p className="text-blue-100 text-lg">
            Professional moving services at your fingertips
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 rounded-full p-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Real-Time Tracking</h3>
              <p className="text-blue-100">
                Track your move in real-time with GPS tracking
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 rounded-full p-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Instant Pricing</h3>
              <p className="text-blue-100">
                Get accurate quotes instantly based on your move details
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 rounded-full p-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Secure Payments</h3>
              <p className="text-blue-100">
                Pay securely with Stripe - all major cards accepted
              </p>
            </div>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          © 2026 Joey Moves Pro. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Joey Moves Pro</h1>
            <p className="text-gray-600 mt-2">Professional Moving Services</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}