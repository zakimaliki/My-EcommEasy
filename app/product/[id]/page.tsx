'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductDetail, Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Loader, AlertCircle, Star } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductDetail(productId);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Products
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Product not found'}
            </h1>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const price = product.price || 0;
  const hasStock = product.stock === undefined || product.stock > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-96 max-w-96 object-contain"
              />
            ) : (
              <div className="h-96 w-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category */}
            {product.item_group_name && (
              <span className="text-sm text-gray-500">
                {product.item_group_name}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < 3
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600">4.0/5 (24 reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-2">Price</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatPrice(price)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock !== undefined && (
                <p
                  className={`text-sm font-semibold ${
                    hasStock ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {hasStock ? `Stock: ${product.stock} available` : 'Out of Stock'}
                </p>
              )}
            </div>

            {/* SKU */}
            <div className="mb-6 pb-6 border-b">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">SKU:</span> {product.sku}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <p className="text-gray-700 font-semibold mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!hasStock}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors mb-4 ${
                isAdded
                  ? 'bg-green-500 text-white'
                  : !hasStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart size={24} />
              {isAdded ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            {/* Continue Shopping */}
            <Link
              href="/"
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
