'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication via API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setLoading(false);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Shift Tracker</h1>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link href="/favorites" className="bento-panel hover:scale-105 transition-transform cursor-pointer active:scale-95">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Favorites</h2>
            <p className="text-sm sm:text-base text-gray-600">Manage your favorite shift templates</p>
          </Link>

          <Link href="/week" className="bento-panel hover:scale-105 transition-transform cursor-pointer active:scale-95">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Week View</h2>
            <p className="text-sm sm:text-base text-gray-600">View and manage your weekly shifts</p>
          </Link>

          <Link href="/month" className="bento-panel hover:scale-105 transition-transform cursor-pointer active:scale-95">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Month View</h2>
            <p className="text-sm sm:text-base text-gray-600">View your monthly schedule</p>
          </Link>

          <Link href="/pay-calculator" className="bento-panel hover:scale-105 transition-transform cursor-pointer active:scale-95">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Pay Calculator</h2>
            <p className="text-sm sm:text-base text-gray-600">Calculate total pay for date ranges</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

