'use client';

import { Product } from '@/lib/api';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const price = product.price || 0;
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-gray-400">No Image</span>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock !== undefined && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold">
            {product.stock > 0 ? (
              <span className="text-green-600">Stock: {product.stock}</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-48">
        {/* Category */}
        {product.item_group_name && (
          <span className="text-xs text-gray-500 mb-1">
            {product.item_group_name}
          </span>
        )}

        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2 cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2 flex-grow">
            {product.description}
          </p>
        )}

        {/* SKU */}
        <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>

        {/* Price and Rating */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">
            {formattedPrice}
          </span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full mt-3 py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            isAdded
              ? 'bg-green-500 text-white'
              : product.stock === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ShoppingCart size={16} />
          {isAdded ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
