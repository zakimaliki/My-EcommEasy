'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                  <UserIcon size={40} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {user.fullName}
                  </h1>
                  <p className="text-blue-100">{user.userName}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Info Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Account Information
                  </h2>
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email Address</p>
                        <p className="text-gray-900 font-medium">{user.email}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    {user.phone && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <Phone size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                          <p className="text-gray-900 font-medium">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Username */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <UserIcon size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Username</p>
                        <p className="text-gray-900 font-medium">{user.userName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                      Edit Profile
                    </button>
                    <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Change Password
                    </button>
                    <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Order History
                    </button>
                    <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Addresses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 Tip:</span> Keep your account
              secure by updating your password regularly and not sharing your
              credentials with anyone.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
