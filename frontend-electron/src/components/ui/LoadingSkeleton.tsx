import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

interface ProductCardSkeletonProps {
  count?: number;
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

// Base skeleton component
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ minHeight: "1rem" }}
    />
  );
};

// Product card skeleton for product grids
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-4 space-y-3">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />

          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>

          {/* Price skeleton */}
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />

          {/* Stock status skeleton */}
          <div className="h-5 bg-gray-200 rounded-full animate-pulse w-2/3" />

          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
};

// Table skeleton for sales/inventory data
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={`header-${index}`}
            className="h-4 bg-gray-300 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 py-2"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-gray-200 rounded animate-pulse"
              style={{
                width: colIndex === 0 ? "100%" : `${60 + Math.random() * 40}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Dashboard stats skeleton
export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="ml-5 w-0 flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Sales list skeleton
export const SalesListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form skeleton
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse flex-1" />
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse flex-1" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
