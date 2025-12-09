import { NextRequest, NextResponse } from 'next/server';
import { getToken, getBaseUrl } from '../../../../lib/jubelio';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Read pagination params using documentation names
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    let pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '12'));
    if (pageSize > 200) pageSize = 200; // per docs

    // Optional filters from docs
    const sortDirection = searchParams.get('sortDirection') || undefined; // ASC/DESC
    const sortBy = searchParams.get('sortBy') || undefined;
    const csv = searchParams.get('csv') || undefined;
    const q = searchParams.get('q') || undefined;
    const channelId = searchParams.get('channelId') || undefined;
    const isFavourite = searchParams.get('isFavourite') || undefined;

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
      // No token available to query Jubelio
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    try {
      const base = getBaseUrl();

      // Jubelio expects page & pageSize for the masters endpoint; translate accordingly
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (sortDirection) params.set('sortDirection', sortDirection);
      if (sortBy) params.set('sortBy', sortBy);
      if (q) params.set('q', q);
      if (channelId) params.set('channelId', channelId);
      if (isFavourite) params.set('isFavourite', isFavourite);
      if (csv) params.set('csv', csv);

      // Use the "masters" endpoint as per Jubelio docs
      const url = `${base}/inventory/items/masters?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If request asks for CSV, passthrough the response body and content-type
      if (csv === 'true' || csv === '1') {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('Jubelio CSV fetch failed:', res.status, text);
          if (res.status === 500) return NextResponse.json({ message: 'Internal server error', details: text }, { status: 500 });
          return NextResponse.json({ message: 'Product not found', details: `upstream status ${res.status}` }, { status: 404 });
        }

        const contentType = res.headers.get('content-type') || 'text/csv';
        const body = await res.text();
        return new NextResponse(body, { status: 200, headers: { 'Content-Type': contentType } });
      }

      if (res.ok) {
        const data = await res.json();
        // masters endpoint returns { data: [...], totalCount }
        const items = data?.data || data?.items || data || [];
        const total = (data?.totalCount as number) || data?.total || data?.count || (Array.isArray(items) ? items.length : 0);

        if (!items || (Array.isArray(items) && items.length === 0)) {
          return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // Normalize items into our frontend Product shape
        const normalized = (items as Array<Record<string, unknown>>).map((it) => {
          const itRec = it as Record<string, unknown>;
          const variants = (itRec['variants'] as unknown) as Array<Record<string, unknown>> | null;
          const firstVariant = Array.isArray(variants) && variants.length > 0 ? variants[0] : null;

          const id = (firstVariant && ((firstVariant['item_id'] ?? firstVariant['id']) as number | undefined)) ?? ((itRec['item_group_id'] ?? itRec['item_id']) as number | undefined) ?? 0;
          const name = (itRec['item_name'] as string | undefined) ?? (firstVariant && (firstVariant['item_name'] as string | undefined)) ?? '';
          const sku = (firstVariant && ((firstVariant['item_code'] ?? firstVariant['sku']) as string | undefined)) ?? '';

          const rawPrice = (firstVariant && ((firstVariant['sell_price'] ?? firstVariant['sellPrice']) as unknown)) ?? (itRec['sell_price'] ?? itRec['sellPrice'] ?? 0);
          const price = typeof rawPrice === 'string' ? parseFloat(rawPrice as string) || 0 : (rawPrice as number) || 0;

          const stock = (firstVariant && ((firstVariant['available_qty'] ?? firstVariant['end_qty'] ?? firstVariant['quantity_on_hand']) as number | undefined)) ?? ((itRec['available_qty'] ?? itRec['end_qty'] ?? itRec['quantity_on_hand']) as number | undefined) ?? 0;

          const image_url = (firstVariant && ((firstVariant['thumbnail'] ?? firstVariant['image']) as string | undefined)) ?? ((itRec['thumbnail'] ?? itRec['image_url'] ?? itRec['image']) as string | undefined);

          const item_group_name = (itRec['item_group_name'] as string | undefined) ?? (itRec['item_name'] as string | undefined) ?? undefined;

          return {
            id,
            name,
            sku,
            description: (itRec['description'] as string | undefined) ?? (itRec['notes'] as string | undefined) ?? '',
            price,
            stock,
            image_url,
            item_group_name,
          };
        });

        return NextResponse.json(
          {
            data: normalized,
            totalCount: total,
            page,
            pageSize,
            totalPages: Math.ceil((total || 0) / pageSize),
          },
          { status: 200 }
        );
      }

      const text = await res.text();
      console.error('Jubelio products fetch failed:', res.status, text);

      if (res.status === 500) {
        return NextResponse.json({ message: 'Internal server error', details: text }, { status: 500 });
      }

      if (res.status === 404) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

      // For other statuses, return 404 with upstream details
      return NextResponse.json({ message: 'Product not found', details: `upstream status ${res.status}: ${text}` }, { status: 404 });
    } catch (jubelioError) {
      console.error('Jubelio API error:', jubelioError);
      return NextResponse.json({ message: 'Internal server error', details: String(jubelioError) }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
