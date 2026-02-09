import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | Joey Moves Pro',
  description: 'Create your Joey Moves Pro account',
};

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
        <p className="text-gray-600 mt-2">
          Get started with Joey Moves Pro in just a few steps
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign in instead
          </Link>
        </div>
      </div>

      <div className="mt-6 text-xs text-center text-gray-500">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-blue-600 hover:text-blue-700">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}