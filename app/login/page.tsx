'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || remainingSeconds === null) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setIsLocked(false);
          setRemainingSeconds(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, remainingSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRemainingAttempts(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use window.location for a full page reload to ensure cookie is set
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed');
        
        // Handle brute force protection responses
        if (data.locked) {
          setIsLocked(true);
          setRemainingSeconds(data.remainingSeconds || null);
        } else {
          setIsLocked(false);
          if (data.remainingAttempts !== undefined) {
            setRemainingAttempts(data.remainingAttempts);
          }
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bento-panel w-full max-w-md fade-in">
        <h1 className="text-3xl font-bold text-center mb-6">Shift Tracker</h1>
        <h2 className="text-xl font-semibold text-center mb-8">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`px-4 py-3 rounded ${
              isLocked 
                ? 'bg-orange-100 border border-orange-400 text-orange-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <div className="font-semibold">{error}</div>
              {isLocked && remainingSeconds !== null && (
                <div className="mt-2 text-sm">
                  Time remaining: <span className="font-mono font-bold">{formatTime(remainingSeconds)}</span>
                </div>
              )}
              {!isLocked && remainingAttempts !== null && remainingAttempts > 0 && (
                <div className="mt-2 text-sm">
                  {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining before lockout
                </div>
              )}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLocked}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLocked}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : isLocked ? 'Account Locked' : 'Login'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

