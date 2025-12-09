'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Loader, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    date: '2025-12-08',
    status: 'delivered',
    total: 500000,
    itemCount: 3,
    items: [
      { id: 1, name: 'Product 1', quantity: 2, price: 100000 },
      { id: 2, name: 'Product 2', quantity: 1, price: 200000 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    date: '2025-12-07',
    status: 'shipped',
    total: 350000,
    itemCount: 2,
    items: [
      { id: 3, name: 'Product 3', quantity: 1, price: 350000 },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    date: '2025-12-05',
    status: 'processing',
    total: 750000,
    itemCount: 5,
    items: [
      { id: 4, name: 'Product 4', quantity: 3, price: 150000 },
      { id: 5, name: 'Product 5', quantity: 2, price: 225000 },
    ],
  },
];

const statusColors: Record<Order['status'], { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-800' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-800' },
  delivered: { bg: 'bg-green-50', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-800' },
};

const statusBadgeColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        // Simulated API call - replace dengan actual API
        // const response = await fetch('/api/orders', {
        //   headers: {
        //     Authorization: `Bearer ${user?.token}`,
        //   },
        // });
        // const data = await response.json();
        // setOrders(data);

        // Mock data for demo
        setOrders(mockOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">
            View and track all your orders
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status as Order['status'] | 'all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No orders found
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `No orders with status "${filter}"`}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const colors = statusColors[order.status];
              const badgeColor = statusBadgeColors[order.status];

              return (
                <div
                  key={order.id}
                  className={`rounded-lg shadow-sm p-6 border-l-4 ${
                    colors.bg === 'bg-yellow-50' ? 'border-yellow-400' :
                    colors.bg === 'bg-blue-50' ? 'border-blue-400' :
                    colors.bg === 'bg-purple-50' ? 'border-purple-400' :
                    colors.bg === 'bg-green-50' ? 'border-green-400' :
                    'border-red-400'
                  } ${colors.bg}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Order Number */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Number</p>
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Date</p>
                      <p className="font-bold text-gray-900">
                        {formatDate(order.date)}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeColor} capitalize`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Total */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="font-bold text-lg text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t pt-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Items ({order.itemCount})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white bg-opacity-50 rounded p-3"
                        >
                          <p className="text-sm text-gray-700 mb-1">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t mt-6 pt-6 flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Track Order
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
