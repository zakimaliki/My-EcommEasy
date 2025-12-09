// Helper utilities to integrate with Jubelio WMS API

export interface JubelioProductRaw {
  id?: number;
  product_id?: number;
  name?: string;
  product_name?: string;
  sku?: string;
  description?: string;
  price?: number;
  selling_price?: number;
  stock?: number;
  quantity_on_hand?: number;
  image_url?: string;
  image?: string;
  category?: string;
  item_group_name?: string;
  [key: string]: unknown;
}

export interface JubelioProduct {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  item_group_name?: string;
}

let cachedToken: string | null = null;
let tokenExpiry = 0; // unix ms

export function getBaseUrl() {
  let base = (
    process.env.JUBELIO_API_URL ||
    process.env.NEXT_PUBLIC_JUBELIO_API_URL ||
    'https://api.integration.jubelio.com'
  ) as string;

  base = base.trim();
  // If user provided hostname without scheme, default to https
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  return base.replace(/\/$/, '');
}

// Try multiple login endpoints (kept for backward compatibility)
async function requestTokenWithBody(body: Record<string, unknown>) {
  const base = getBaseUrl();
  const candidates = [
    // prefer api2 login if base configured explicitly via env
    process.env.JUBELIO_LOGIN_URL || 'https://api2.jubelio.com/login',
    `${base}/api/v1/login`,
    `${base}/api/v1/auth/login`,
    `${base}/api/login`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? (JSON.parse(text) as unknown) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        // if invalid credentials per Jubelio docs they may return 500 — propagate this for caller to handle
        if (res.status === 500) {
          const err = new Error('Invalid Username or Password') as Error & {
            status?: number;
            raw?: unknown;
          };
          err.status = res.status;
          err.raw = data;
          throw err;
        }
        continue;
      }

      const parsed = data as Record<string, unknown> | null;
      const token = parsed?.token as string | undefined || (parsed?.data as Record<string, unknown> | undefined)?.token as string | undefined || parsed?.access_token as string | undefined || (parsed?.data as Record<string, unknown> | undefined)?.access_token as string | undefined;
      const expiresIn = (parsed?.expires_in as number | undefined) || ((parsed?.data as Record<string, unknown> | undefined)?.expires_in as number | undefined) || 3600;

      if (token) return { token, expiresIn, data };
      // If response ok but no token, still return full data
      return { token: null as string | null, expiresIn, data };
    } catch (errCatch) {
      const maybe = errCatch as { status?: number };
      if (maybe?.status === 500) throw errCatch;
      // otherwise try next candidate
    }
  }

  throw new Error('Unable to obtain token from Jubelio API');
}

// New: explicit authenticate that always calls the official login URL (api2)
export async function authenticateWithEmailPassword(email: string, password: string) {
  const url = process.env.JUBELIO_LOGIN_URL || 'https://api2.jubelio.com/login';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error('Invalid Username or Password') as Error & {
      status?: number;
      raw?: unknown;
    };
    err.status = res.status || 500;
    err.raw = data;
    throw err;
  }

  return data as Record<string, unknown>;
}

export async function getToken(options?: { email?: string; password?: string; clientId?: string; clientSecret?: string; force?: boolean }) {
  if (cachedToken && Date.now() < tokenExpiry && !options?.force) {
    return cachedToken;
  }

  // 1) If API key provided, use it directly
  const apiKey = process.env.JUBELIO_API_KEY || process.env.NEXT_PUBLIC_JUBELIO_API_KEY;
  if (apiKey) {
    cachedToken = apiKey;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // treat as long-lived
    return cachedToken;
  }

  // 2) Prefer explicit options if provided
  if (options?.clientId && options?.clientSecret) {
    const { token, expiresIn } = await requestTokenWithBody({ client_id: options.clientId, client_secret: options.clientSecret });
    cachedToken = token as string | null;
    tokenExpiry = Date.now() + (expiresIn as number) * 1000 - 60000;
    return cachedToken;
  }

  if (options?.email && options?.password) {
    // prefer auth against api2 endpoint
    try {
      const data = await authenticateWithEmailPassword(options.email, options.password);
      const parsed = data as Record<string, unknown> | null;
      const token = parsed?.token as string | undefined || (parsed?.access_token as string | undefined) || ((parsed?.data as Record<string, unknown> | undefined)?.token as string | undefined) || ((parsed?.data as Record<string, unknown> | undefined)?.access_token as string | undefined);
      const expiresIn = (parsed?.expires_in as number | undefined) || ((parsed?.data as Record<string, unknown> | undefined)?.expires_in as number | undefined) || 3600;
      if (token) {
        cachedToken = token;
        tokenExpiry = Date.now() + (expiresIn as number) * 1000 - 60000;
        return cachedToken;
      }
      // if no token returned, fallback to generic requestTokenWithBody
      const resp = await requestTokenWithBody({ email: options.email, password: options.password });
      cachedToken = resp.token as string | null;
      tokenExpiry = Date.now() + (resp.expiresIn as number) * 1000 - 60000;
      return cachedToken;
    } catch (errAuth) {
      throw errAuth;
    }
  }

  // 3) Fall back to environment variables
  const clientId = process.env.JUBELIO_CLIENT_ID;
  const clientSecret = process.env.JUBELIO_CLIENT_SECRET;
  if (clientId && clientSecret) {
    const { token, expiresIn } = await requestTokenWithBody({ client_id: clientId, client_secret: clientSecret });
    cachedToken = token as string | null;
    tokenExpiry = Date.now() + (expiresIn as number) * 1000 - 60000;
    return cachedToken;
  }

  const emailEnv = process.env.JUBELIO_EMAIL;
  const passwordEnv = process.env.JUBELIO_PASSWORD;
  if (emailEnv && passwordEnv) {
    const { token, expiresIn } = await requestTokenWithBody({ email: emailEnv, password: passwordEnv });
    cachedToken = token as string | null;
    tokenExpiry = Date.now() + (expiresIn as number) * 1000 - 60000;
    return cachedToken;
  }

  throw new Error('No Jubelio credentials configured in environment nor provided');
}

function normalizeProduct(item: JubelioProductRaw): JubelioProduct {
  const id = (item.id ?? item.product_id ?? 0) as number;
  return {
    id,
    name: (item.name ?? item.product_name ?? '') as string,
    sku: item.sku as string | undefined,
    description: item.description as string | undefined,
    price: (item.price ?? item.selling_price ?? 0) as number | undefined,
    stock: (item.stock ?? item.quantity_on_hand ?? 0) as number | undefined,
    image_url: (item.image_url ?? item.image) as string | undefined,
    item_group_name: (item.category ?? item.item_group_name) as string | undefined,
  };
}

export async function fetchProductsFromJubelio(page = 1, limit = 12) {
  const token = await getToken();
  const base = getBaseUrl();
  const offset = (page - 1) * limit;

  const url = `${base}/api/v1/products?offset=${offset}&limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jubelio products request failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  const items = data.data || data.items || data.products || [];
  const total = data.total || data.count || items.length;

  const products = (items as JubelioProductRaw[]).map(normalizeProduct);

  return {
    products,
    total,
  };
}

export async function fetchProductByIdFromJubelio(id: number) {
  const token = await getToken();
  const base = getBaseUrl();

  const url = `${base}/api/v1/products/${id}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jubelio product detail request failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  const item = data.data || data.item || data.product || data;
  return normalizeProduct(item as JubelioProductRaw);
}
