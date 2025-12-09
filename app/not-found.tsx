'use client';

import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <AlertTriangle className="mx-auto mb-6 text-red-600" size={64} />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Home size={20} />
          Back to Home
        </Link>

        <div className="mt-12">
          <p className="text-gray-600 text-sm mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Login
            </Link>
            <Link href="/cart" className="text-blue-600 hover:text-blue-700">
              Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
