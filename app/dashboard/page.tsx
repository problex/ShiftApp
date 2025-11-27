'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const funnyGreetings = [
  "Welcome back! Time to clock in... or out? 🤔",
  "Hey there! Ready to track those shifts like a pro? 💪",
  "Welcome! Let's make sure you get paid for every minute! ⏰",
  "Back again? Someone's dedicated! Or just checking their schedule... 😄",
  "Welcome! Time to turn those hours into dollars! 💰",
  "Hey! Ready to see how much money you're making? (Or not making?) 😅",
  "Welcome back! Let's see if you're working more than you're sleeping! 😴",
  "Hey there! Time to track shifts and calculate that sweet, sweet cash! 🎉",
  "Welcome! Because remembering your schedule is hard, but tracking it shouldn't be! 🧠",
  "Back for more? Your shifts won't track themselves! (Unfortunately) 📊",
  "Welcome! Let's see if you can beat your record for most shifts in a week! 🏆",
  "Hey! Time to prove you're not just working, you're working SMART! 🧠",
  "Welcome back! Ready to see how many hours you've spent... working? 😅",
  "Hey there! Let's turn your chaotic schedule into organized chaos! 📅",
  "Welcome! Because life's too short to manually calculate your pay! ⚡",
  "Back again? Someone's on top of their game! (Or trying to be) 🎮",
  "Welcome! Time to see if you're actually making money or just working for fun! 💸",
  "Hey! Ready to track shifts like the organized person you aspire to be? ✨",
  "Welcome back! Let's see how many shifts you've worked this week! (Spoiler: probably too many) 😂",
  "Hey there! Time to make your boss jealous of your organizational skills! 📈",
  "Welcome! Because tracking shifts manually is so 2020! 🚀",
  "Back for more? Your future self will thank you for tracking these shifts! 🙏",
  "Welcome! Let's see if you can remember what you did last week! (We'll help) 🧩",
  "Hey! Ready to turn your work schedule into a work of art? 🎨",
  "Welcome back! Time to see if you're working hard or hardly working! 😏",
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Select a random greeting each time the page loads
    const randomGreeting = funnyGreetings[Math.floor(Math.random() * funnyGreetings.length)];
    setGreeting(randomGreeting);

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
          <div className="flex items-center gap-3">
            <Image
              src="/icon.svg"
              alt="Shift Tracker Icon"
              width={48}
              height={48}
              className="sm:w-12 sm:h-12"
              priority
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Shift Tracker</h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>

        {greeting && (
          <div className="bento-panel mb-6 sm:mb-8 fade-in">
            <p className="text-lg sm:text-xl font-medium text-center">{greeting}</p>
          </div>
        )}

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

