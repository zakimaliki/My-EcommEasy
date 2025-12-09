// Utility functions untuk e-commerce app

/**
 * Format price ke currency Rupiah
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date ke format Indonesia
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format datetime ke format Indonesia
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text dengan ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

/**
 * Format SKU ke format yang lebih readable
 */
export function formatSKU(sku: string): string {
  return sku.toUpperCase().replace(/[-_]/g, ' ');
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isStrong: errors.length === 0,
    errors,
  };
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number
): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Format number ke format Indonesia (1.000.000)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

/**
 * Get status color untuk order
 */
export function getStatusColor(
  status: string
): { bg: string; text: string; badge: string } {
  const statusColors: Record<
    string,
    { bg: string; text: string; badge: string }
  > = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    processing: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
    },
    shipped: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      badge: 'bg-purple-100 text-purple-800',
    },
    delivered: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
    },
  };

  return statusColors[status] || statusColors.pending;
}

/**
 * Get status label
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return labels[status] || status;
}

/**
 * Check if product is in stock
 */
export function isInStock(stock: number | undefined): boolean {
  return stock === undefined || stock > 0;
}

/**
 * Calculate tax
 */
export function calculateTax(price: number, taxPercentage: number = 10): number {
  return price * (taxPercentage / 100);
}

/**
 * Calculate total dengan tax dan shipping
 */
export function calculateTotal(
  subtotal: number,
  taxPercentage: number = 10,
  shipping: number = 0
): number {
  const tax = calculateTax(subtotal, taxPercentage);
  return subtotal + tax + shipping;
}

/**
 * Delay function untuk async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

/**
 * Local storage helper untuk type-safe access
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}
