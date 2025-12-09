'use client';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 w-full bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-3 w-full" />
        <div className="h-4 bg-gray-200 rounded mb-6 w-1/2" />
        
        {/* Price and Button Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-6 p-6 animate-pulse border-b">
      <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-grow">
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded mb-2 w-24" />
            <div className="h-5 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
