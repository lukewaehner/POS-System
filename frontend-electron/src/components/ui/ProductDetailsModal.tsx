import React, { useState } from "react";
import Modal from "./Modal";
import { Product, StockMovement } from "../../services";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number) => void;
  onEditProduct?: (product: Product) => void;
  showAdminFeatures?: boolean;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onEditProduct,
  showAdminFeatures = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showStockHistory, setShowStockHistory] = useState(false);

  if (!product) return null;

  // Mock stock history data (in real app, this would come from API)
  const generateMockStockHistory = (productId: number): StockMovement[] => {
    const movements: StockMovement[] = [];
    let currentStock = product.stock_quantity;
    const now = new Date();

    // Generate last 10 movements
    for (let i = 0; i < 10; i++) {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const types: StockMovement["type"][] = [
        "sale",
        "restock",
        "adjustment",
        "return",
        "damage",
      ];
      const type = types[Math.floor(Math.random() * types.length)];

      let quantityChange: number;
      let reason: string;

      switch (type) {
        case "sale":
          quantityChange = -(Math.floor(Math.random() * 5) + 1);
          reason = "Product sold";
          break;
        case "restock":
          quantityChange = Math.floor(Math.random() * 50) + 10;
          reason = "Inventory restock";
          break;
        case "adjustment":
          quantityChange = Math.floor(Math.random() * 10) - 5;
          reason =
            quantityChange > 0
              ? "Inventory count adjustment (+)"
              : "Inventory count adjustment (-)";
          break;
        case "return":
          quantityChange = Math.floor(Math.random() * 3) + 1;
          reason = "Customer return";
          break;
        case "damage":
          quantityChange = -(Math.floor(Math.random() * 3) + 1);
          reason = "Damaged inventory removed";
          break;
        default:
          quantityChange = 0;
          reason = "Unknown";
      }

      const previousStock = currentStock - quantityChange;

      movements.push({
        id: i + 1,
        product_id: product.id,
        type,
        quantity: quantityChange,
        previous_stock: previousStock,
        new_stock: currentStock,
        reason,
        timestamp: timestamp.toISOString(),
        user: ["Admin", "Manager", "Staff"][Math.floor(Math.random() * 3)],
      });

      currentStock = previousStock;
    }

    return movements.reverse(); // Show newest first
  };

  const stockHistory = generateMockStockHistory(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMovementIcon = (type: StockMovement["type"]) => {
    switch (type) {
      case "sale":
        return "🛒";
      case "restock":
        return "📦";
      case "adjustment":
        return "⚖️";
      case "return":
        return "↩️";
      case "damage":
        return "❌";
      default:
        return "📝";
    }
  };

  const getMovementColor = (quantity: number) => {
    if (quantity > 0) return "text-green-600";
    if (quantity < 0) return "text-red-600";
    return "text-gray-600";
  };

  const isLowStock = product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  const getStockStatusColor = () => {
    if (isOutOfStock) return "bg-red-100 text-red-800";
    if (isLowStock) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStockStatusText = () => {
    if (isOutOfStock) return "Out of Stock";
    if (isLowStock) return `Low Stock (${product.stock_quantity} remaining)`;
    return `In Stock (${product.stock_quantity} available)`;
  };

  const handleAddToCart = () => {
    if (!isOutOfStock && quantity > 0) {
      onAddToCart(product, quantity);
      onClose();
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
              className={`flex items-center justify-center text-6xl text-gray-400 ${
                product.image_url ? "hidden" : ""
              }`}
            >
              📦
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-center">
            <span
              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStockStatusColor()}`}
            >
              {getStockStatusText()}
            </span>
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h2>
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Product Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Product ID:</span>
                  <span className="font-medium">#{product.id}</span>
                </div>
                {product.barcode && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Barcode:</span>
                    <span className="font-mono font-medium">
                      {product.barcode}
                    </span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock Quantity:</span>
                  <span className="font-medium">
                    {product.stock_quantity} units
                  </span>
                </div>
                {product.tax_rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax Rate:</span>
                    <span className="font-medium">
                      {(product.tax_rate * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Add to Cart
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      min="1"
                      max={product.stock_quantity}
                      className="w-16 h-10 text-center border border-gray-300 rounded-lg font-medium"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Total: {formatPrice(product.price * quantity)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock History */}
        <div className="space-y-4">
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Stock History
              </h3>
              <button
                onClick={() => setShowStockHistory(!showStockHistory)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showStockHistory ? "Hide" : "Show"} Details
              </button>
            </div>

            {showStockHistory ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {stockHistory.map((movement) => (
                  <div
                    key={movement.id}
                    className="bg-gray-50 rounded-lg p-3 border text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getMovementIcon(movement.type)}
                        </span>
                        <span className="font-medium capitalize">
                          {movement.type}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${getMovementColor(
                          movement.quantity
                        )}`}
                      >
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs mb-1">
                      {movement.reason}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {movement.previous_stock} → {movement.new_stock} units
                      </span>
                      <span>{formatDate(movement.timestamp)}</span>
                    </div>
                    {movement.user && (
                      <div className="text-xs text-gray-500 mt-1">
                        By: {movement.user}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 space-y-2">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-medium">Recent Activity</div>
                  <div className="text-xs mt-1">
                    Last {stockHistory.length} movements tracked
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Click "Show Details" to view full history
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t">
        <div className="flex space-x-3">
          {showAdminFeatures && onEditProduct && (
            <button
              onClick={() => {
                onEditProduct(product);
                onClose();
              }}
              className="btn-secondary"
            >
              ✏️ Edit Product
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          {!isOutOfStock && (
            <button onClick={handleAddToCart} className="btn-primary">
              🛒 Add {quantity} to Cart
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
