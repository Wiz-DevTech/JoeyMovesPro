import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | Joey Moves Pro',
  description: 'Sign in to your Joey Moves Pro account',
};

export default function LoginPage() {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
      </div>

      <LoginForm />

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New to Joey Moves?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/register"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700">
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}