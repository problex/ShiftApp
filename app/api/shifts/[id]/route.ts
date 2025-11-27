import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, startTime, endTime, payRate, client, color, highPriority } = body;

    if (!title || !startTime || !endTime || payRate === undefined || payRate === null || payRate === '' || !color) {
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
    const result = await db.collection('shifts').updateOne(
      { _id: new ObjectId(params.id), userId },
      {
        $set: {
          title,
          startTime,
          endTime,
          payRate: payRateNum,
          client: client || null,
          color,
          highPriority: highPriority === true || highPriority === 'true',
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shift updated successfully' });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const result = await db.collection('shifts').deleteOne({
      _id: new ObjectId(params.id),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

