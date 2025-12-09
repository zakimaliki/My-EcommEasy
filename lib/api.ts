// API client untuk komunikasi dengan backend
// Gunakan relative URL untuk API routes

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  item_group_name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}

export interface CartItem extends Product {
  quantity: number;
}

// Fetch products dari API
export async function fetchProducts(page: number = 1, limit: number = 12) {
  try {
    // Attach Authorization header if user token present in localStorage
    let token: string | null = null;
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved) as { token?: string };
        token = parsed?.token ?? null;
      }
    } catch {
      token = null;
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/jubelio/products?page=${page}&limit=${limit}`, { headers });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to fetch products: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data as PaginatedResponse<Product>;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Fetch product detail
export async function fetchProductDetail(id: number) {
  try {
    // Attach Authorization header if user token present in localStorage
    let token: string | null = null;
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved) as { token?: string };
        token = parsed?.token ?? null;
      }
    } catch {
      token = null;
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/jubelio/products/${id}`, { headers });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to fetch product detail: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data as Product;
  } catch (error) {
    console.error('Error fetching product detail:', error);
    throw error;
  }
}

// Login - accept optional credentials
export async function login(email?: string, password?: string) {
  try {
    const body: Record<string, unknown> = {};
    if (email) body.email = email;
    if (password) body.password = password;

    const response = await fetch(`/api/jubelio/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Object.keys(body).length ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Login failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}
