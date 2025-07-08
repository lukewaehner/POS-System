import React from "react";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  barcode?: string;
  category?: string;
  image_url?: string;
  tax_rate?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
  disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  disabled = false,
}) => {
  const isLowStock = product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  const handleAddToCart = () => {
    if (!isOutOfStock && !disabled) {
      onAddToCart(product, 1);
    }
  };

  const handleCardClick = () => {
    onViewDetails(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStockStatusColor = () => {
    if (isOutOfStock) return "bg-red-100 text-red-800";
    if (isLowStock) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStockStatusText = () => {
    if (isOutOfStock) return "Out of Stock";
    if (isLowStock) return `Low Stock (${product.stock_quantity})`;
    return `In Stock (${product.stock_quantity})`;
  };

  return (
    <div
      className={`card p-4 transition-all duration-200 ${
        disabled || isOutOfStock
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md hover:scale-105 cursor-pointer"
      }`}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={`flex items-center justify-center text-4xl text-gray-400 ${
            product.image_url ? "hidden" : ""
          }`}
        >
          📦
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-blue-600">
          {formatPrice(product.price)}
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor()}`}
          >
            {getStockStatusText()}
          </span>
        </div>

        {/* Category and Barcode */}
        {(product.category || product.barcode) && (
          <div className="text-sm text-gray-500 space-y-1">
            {product.category && (
              <div className="flex items-center space-x-1">
                <span>🏷️</span>
                <span>{product.category}</span>
              </div>
            )}
            {product.barcode && (
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span className="font-mono text-xs">{product.barcode}</span>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={disabled || isOutOfStock}
          className={`w-full mt-3 py-3 px-4 rounded-lg font-medium text-lg transition-colors duration-200 ${
            disabled || isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "btn-primary"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
