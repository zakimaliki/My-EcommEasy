import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '../../../../../lib/jubelio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Prefer token from incoming Authorization header (frontend should send 'Authorization: Bearer <token>')
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let token: string | null = null;

    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    } else {
      try {
        token = await getToken();
      } catch (e) {
        console.error('Unable to obtain server token for Jubelio:', e);
        token = null;
      }
    }

    if (!token) {
      // No token available to query Jubelio, return not found per new requirement
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    try {
      const base = (process.env.JUBELIO_API_URL || process.env.NEXT_PUBLIC_JUBELIO_API_URL || 'https://api2.jubelio.com').replace(/\/$/, '');
      const url = `${base}/inventory/items/${id}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        // If response has no content or empty object, return 404
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
          return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(data, { status: 200 });
      }

      const text = await res.text();
      console.error('Jubelio item fetch failed:', res.status, text);

      if (res.status === 500) {
        return NextResponse.json({ message: 'Internal server error', details: text }, { status: 500 });
      }

      if (res.status === 404) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

      // For other statuses, return 404 per requirement (no mock data)
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    } catch (jubelioError) {
      console.error('Jubelio product detail error:', jubelioError);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
