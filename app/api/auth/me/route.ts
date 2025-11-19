import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, userId });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

