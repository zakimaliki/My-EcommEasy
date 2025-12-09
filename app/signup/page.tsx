'use client';

import { useEffect } from 'react';

export default function SignupRedirect() {
  useEffect(() => {
    // Immediately redirect to Jubelio registration page
    window.location.href = 'https://v2.jubelio.com/auth/register';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">Redirecting to registration page...</p>
    </div>
  );
}
