import React, { useState, useEffect, useRef } from "react";
import { Product } from "../../services/productsService";
import { useProducts } from "../../hooks/useProducts";

interface QuickAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedBarcode: string;
  onProductAdded: (product: Product) => void;
}

interface ProductFormData {
  name: string;
  barcode: string;
  price: number | string;
  stock_quantity: number | string;
  category: string;
  description: string;
}

const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({
  isOpen,
  onClose,
  scannedBarcode,
  onProductAdded,
}) => {
  const { createProduct } = useProducts();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    barcode: scannedBarcode,
    price: "",
    stock_quantity: "1",
    category: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update barcode when scannedBarcode changes
  useEffect(() => {
    if (scannedBarcode) {
      setFormData((prev) => ({ ...prev, barcode: scannedBarcode }));
    }
  }, [scannedBarcode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        barcode: scannedBarcode,
        price: "",
        stock_quantity: "1",
        category: "",
        description: "",
      });
      setError(null);
    }
  }, [isOpen, scannedBarcode]);

  // Focus management and keyboard event handling
  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);

      // Handle keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle keyboard events if the modal is open
        if (!isOpen) return;

        // Handle Escape key
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onClose();
          return;
        }

        // Prevent other keyboard events from bubbling to underlying components
        // only if the target is within the modal
        if (modalRef.current && modalRef.current.contains(e.target as Node)) {
          e.stopPropagation();
        }
      };

      // Add event listener with capture to intercept events before they bubble
      document.addEventListener("keydown", handleKeyDown, true);

      return () => {
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside modal to close
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Store the raw value, convert to number only when needed
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Convert and validate numeric fields
      const price =
        typeof formData.price === "string"
          ? parseFloat(formData.price) || 0
          : formData.price;
      const stockQuantity =
        typeof formData.stock_quantity === "string"
          ? parseFloat(formData.stock_quantity) || 0
          : formData.stock_quantity;

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }
      if (!formData.barcode.trim()) {
        throw new Error("Barcode is required");
      }
      if (price <= 0) {
        throw new Error("Price must be greater than 0");
      }

      // Create product using the real API
      const createdProduct = await createProduct({
        name: formData.name.trim(),
        barcode: formData.barcode.trim(),
        price: price,
        stock_quantity: stockQuantity,
        category: formData.category.trim() || "Uncategorized",
        description: formData.description.trim(),
      });

      if (createdProduct) {
        onProductAdded(createdProduct);
        onClose();
      } else {
        throw new Error("Failed to create product");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
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

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800">
                Barcode <strong>{scannedBarcode}</strong> not found in inventory
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                ref={firstInputRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode *
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Scanned barcode"
                required
                readOnly
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sell Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Stock and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Household">Household</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books & Media">Books & Media</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional product description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickAddProductModal;
