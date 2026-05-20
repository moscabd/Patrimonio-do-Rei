import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateSession } from '@/lib/auth';

const SESSION_TOKEN_NAME = 'auth_token';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_TOKEN_NAME)?.value;

    if (token) {
      await invalidateSession(token);
    }

    cookieStore.delete(SESSION_TOKEN_NAME);

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
