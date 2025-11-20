import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import {
  checkLockoutStatus,
  recordFailedAttempt,
  clearFailedAttempts,
  getRemainingAttempts,
} from '@/lib/bruteForce';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if account is locked due to brute force protection
    const lockoutStatus = await checkLockoutStatus(email);
    if (lockoutStatus.isLocked) {
      const minutes = Math.floor((lockoutStatus.remainingSeconds || 0) / 60);
      const seconds = (lockoutStatus.remainingSeconds || 0) % 60;
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${minutes}m ${seconds}s.`,
          locked: true,
          remainingSeconds: lockoutStatus.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const db = await getDb();
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email });
    if (!user) {
      // Record failed attempt even if user doesn't exist (prevents email enumeration)
      await recordFailedAttempt(email);
      const remaining = await getRemainingAttempts(email);
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: remaining,
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Record failed attempt
      await recordFailedAttempt(email);
      const remaining = await getRemainingAttempts(email);
      
      // Check if we just got locked out
      const newLockoutStatus = await checkLockoutStatus(email);
      if (newLockoutStatus.isLocked) {
        const minutes = Math.floor((newLockoutStatus.remainingSeconds || 0) / 60);
        const seconds = (newLockoutStatus.remainingSeconds || 0) % 60;
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Account locked for ${minutes}m ${seconds}s.`,
            locked: true,
            remainingSeconds: newLockoutStatus.remainingSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: remaining,
        },
        { status: 401 }
      );
    }

    // Clear any failed login attempts on successful login
    await clearFailedAttempts(email);

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('MongoServerError')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please ensure MongoDB is running.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

