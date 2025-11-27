import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();
    const query: any = { userId };

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const shifts = await db
      .collection('shifts')
      .find(query)
      .sort({ date: 1, startTime: 1 })
      .toArray();

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, favoriteShiftId, title, startTime, endTime, payRate, client, color, highPriority } = body;

    if (!date || !title || !startTime || !endTime || payRate === undefined || payRate === null || payRate === '' || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payRateNum = parseFloat(payRate);
    if (isNaN(payRateNum) || payRateNum < 0) {
      return NextResponse.json(
        { error: 'Pay rate must be a valid number >= 0' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('shifts').insertOne({
      userId,
      date,
      favoriteShiftId: favoriteShiftId || null,
      title,
      startTime,
      endTime,
      payRate: payRateNum,
      client: client || null,
      color,
      highPriority: highPriority === true || highPriority === 'true',
      createdAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, ...body },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

