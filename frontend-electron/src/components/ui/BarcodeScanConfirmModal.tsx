import React, { useEffect, useRef } from "react";
import { Product } from "../../services/productsService";

interface BarcodeScanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // Optional for new products
  scannedBarcode: string;
  onSaveAndAddToCart: (product: Product) => void;
  onJustSave: (product: Product) => void;
  onCreateAndAddToCart?: (barcode: string) => void; // For new products
  onJustCreate?: (barcode: string) => void; // For new products
  isNewProduct?: boolean; // Flag to indicate if this is a new product
}

const BarcodeScanConfirmModal: React.FC<BarcodeScanConfirmModalProps> = ({
  isOpen,
  onClose,
  product,
  scannedBarcode,
  onSaveAndAddToCart,
  onJustSave,
  onCreateAndAddToCart,
  onJustCreate,
  isNewProduct = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { text: "Out of Stock", color: "text-red-600 bg-red-100" };
    if (stock <= 5)
      return { text: "Low Stock", color: "text-yellow-600 bg-yellow-100" };
    return { text: "In Stock", color: "text-green-600 bg-green-100" };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">
                  {isNewProduct ? "📝" : "📦"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isNewProduct ? "New Product Scanned" : "Product Scanned"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isNewProduct
                    ? "This barcode is not in your inventory"
                    : "Choose what to do with this product"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isNewProduct ? (
            // New Product Content
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Not Found
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Barcode:{" "}
                    <span className="font-mono font-medium">
                      {scannedBarcode}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    This barcode is not in your inventory. You can create a new
                    product with this barcode.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Existing Product Content
            product && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">🏷️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Barcode:{" "}
                      <span className="font-mono">{scannedBarcode}</span>
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStockStatus(product.stock_quantity).color
                        }`}
                      >
                        {getStockStatus(product.stock_quantity).text}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Stock: {product.stock_quantity} units
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isNewProduct ? (
              // New Product Actions
              <>
                <button
                  onClick={() => onCreateAndAddToCart?.(scannedBarcode)}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Product and Add to Cart
                </button>

                <button
                  onClick={() => onJustCreate?.(scannedBarcode)}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Just Create Product
                </button>
              </>
            ) : (
              // Existing Product Actions
              product && (
                <>
                  <button
                    onClick={() => onSaveAndAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      product.stock_quantity === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m4.5 6v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6m4 0V9a1 1 0 011-1h2a1 1 0 011 1v4"
                      />
                    </svg>
                    {product.stock_quantity === 0
                      ? "Out of Stock"
                      : "Save and Add to Cart"}
                  </button>

                  <button
                    onClick={() => onJustSave(product)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Just Save (No Cart)
                  </button>
                </>
              )
            )}

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanConfirmModal;
