import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithEmailPassword } from '../../../../lib/jubelio';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      password?: unknown;
    };

    const email = typeof body.email === 'string' ? body.email : undefined;
    const password = typeof body.password === 'string' ? body.password : undefined;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    try {
      const data = await authenticateWithEmailPassword(email, password);
      // Return the full Jubelio response (contains token and other metadata)
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      const maybe = err as { status?: number; raw?: unknown };
      if (maybe?.status === 500) {
        return NextResponse.json(
          { message: 'Invalid Username or Password', details: maybe.raw ?? null },
          { status: 500 }
        );
      }

      console.error('Jubelio authentication failed:', err);
      return NextResponse.json({ message: 'Unable to authenticate with Jubelio', details: String((err as Error).message) }, { status: 502 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
