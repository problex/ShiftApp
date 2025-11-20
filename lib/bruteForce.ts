import { getDb } from './db';

const MAX_ATTEMPTS = 6;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface LoginAttempt {
  _id?: string;
  email: string;
  attempts: number;
  lockedUntil: Date | null;
  lastAttempt: Date;
}

/**
 * Check if an email is currently locked out due to too many failed login attempts
 * @param email - The email address to check
 * @returns Object with isLocked boolean and remaining time in seconds if locked
 */
export async function checkLockoutStatus(
  email: string
): Promise<{ isLocked: boolean; remainingSeconds?: number }> {
  const db = await getDb();
  const attemptsCollection = db.collection<LoginAttempt>('loginAttempts');

  const attempt = await attemptsCollection.findOne({ email });

  if (!attempt || !attempt.lockedUntil) {
    return { isLocked: false };
  }

  const now = new Date();
  const lockedUntil = new Date(attempt.lockedUntil);

  // Check if lockout period has expired
  if (now >= lockedUntil) {
    // Lockout expired, clean up the record
    await attemptsCollection.deleteOne({ email });
    return { isLocked: false };
  }

  // Still locked, calculate remaining time
  const remainingMs = lockedUntil.getTime() - now.getTime();
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return { isLocked: true, remainingSeconds };
}

/**
 * Record a failed login attempt
 * @param email - The email address that failed to login
 */
export async function recordFailedAttempt(email: string): Promise<void> {
  const db = await getDb();
  const attemptsCollection = db.collection<LoginAttempt>('loginAttempts');

  const now = new Date();
  const attempt = await attemptsCollection.findOne({ email });

  if (!attempt) {
    // First failed attempt
    await attemptsCollection.insertOne({
      email,
      attempts: 1,
      lockedUntil: null,
      lastAttempt: now,
    });
    return;
  }

  const newAttemptCount = attempt.attempts + 1;

  // If this is the 6th failed attempt, set lockout
  const lockedUntil =
    newAttemptCount >= MAX_ATTEMPTS
      ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
      : null;

  await attemptsCollection.updateOne(
    { email },
    {
      $set: {
        attempts: newAttemptCount,
        lockedUntil,
        lastAttempt: now,
      },
    }
  );
}

/**
 * Clear failed login attempts for an email (called on successful login)
 * @param email - The email address that successfully logged in
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  const db = await getDb();
  const attemptsCollection = db.collection<LoginAttempt>('loginAttempts');
  await attemptsCollection.deleteOne({ email });
}

/**
 * Get the number of remaining attempts before lockout
 * @param email - The email address to check
 * @returns Number of remaining attempts (0 if locked)
 */
export async function getRemainingAttempts(email: string): Promise<number> {
  const db = await getDb();
  const attemptsCollection = db.collection<LoginAttempt>('loginAttempts');

  const attempt = await attemptsCollection.findOne({ email });

  if (!attempt) {
    return MAX_ATTEMPTS;
  }

  // Check if locked
  if (attempt.lockedUntil) {
    const now = new Date();
    const lockedUntil = new Date(attempt.lockedUntil);

    if (now < lockedUntil) {
      return 0; // Currently locked
    } else {
      // Lockout expired, clean up
      await attemptsCollection.deleteOne({ email });
      return MAX_ATTEMPTS;
    }
  }

  return Math.max(0, MAX_ATTEMPTS - attempt.attempts);
}

