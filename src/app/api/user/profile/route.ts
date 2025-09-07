import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a basic response since Firebase operations should happen on client-side
    return NextResponse.json({
      message: 'Use client-side Firebase operations',
      userId
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Validate the updates
    if (updates.primaryCurrency && typeof updates.primaryCurrency !== 'string') {
      return NextResponse.json(
        { error: 'Invalid primary currency' },
        { status: 400 }
      );
    }

    if (updates.preferences && typeof updates.preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences' },
        { status: 400 }
      );
    }

    // Return success since Firebase operations should happen on client-side
    return NextResponse.json({
      message: 'Use client-side Firebase operations',
      userId,
      updates
    });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}