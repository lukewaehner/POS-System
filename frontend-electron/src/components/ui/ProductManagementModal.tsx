import React, { useState, useEffect, useRef } from "react";
import { Product } from "../../services/productsService";
import { useProducts } from "../../hooks/useProducts";
import { useNotifications } from "../../hooks/useNotifications";

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated?: (product: Product) => void;
}

const ProductManagementModal: React.FC<ProductManagementModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}) => {
  const { updateProduct, deleteProduct, categories } = useProducts();
  const { addNotification } = useNotifications();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "" as string | number,
    stock_quantity: "" as string | number,
    category: "",
    barcode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "details" | "inventory" | "history"
  >("details");

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setEditForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price.toString() || "",
        stock_quantity: product.stock_quantity.toString() || "",
        category: product.category_name || product.category || "",
        barcode: product.barcode || "",
      });
    }
  }, [product]);

  // Focus management and keyboard event handling
  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens and editing starts
      if (isEditing) {
        setTimeout(() => {
          if (firstInputRef.current) {
            firstInputRef.current.focus();
          }
        }, 100);
      }

      // Handle keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle keyboard events if the modal is open
        if (!isOpen) return;

        // Handle Escape key
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          if (isEditing) {
            setIsEditing(false);
            setError(null);
          } else {
            onClose();
          }
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
  }, [isOpen, isEditing, onClose]);

  // Handle click outside modal to close
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          if (isEditing) {
            setIsEditing(false);
            setError(null);
          } else {
            onClose();
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, isEditing, onClose]);

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSave = async () => {
    if (!product) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert and validate numeric fields
      const price =
        typeof editForm.price === "string"
          ? parseFloat(editForm.price) || 0
          : editForm.price;
      const stockQuantity =
        typeof editForm.stock_quantity === "string"
          ? parseFloat(editForm.stock_quantity) || 0
          : editForm.stock_quantity;

      // Validate required fields
      if (!editForm.name.trim()) {
        throw new Error("Product name is required");
      }
      if (price < 0) {
        throw new Error("Price cannot be negative");
      }
      if (stockQuantity < 0) {
        throw new Error("Stock quantity cannot be negative");
      }

      const updatedProduct = {
        ...product,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: price,
        stock_quantity: stockQuantity,
        category: editForm.category.trim(),
        barcode: editForm.barcode.trim(),
      };

      await updateProduct(product.id, updatedProduct);

      addNotification({
        type: "success",
        message: "Product updated successfully",
        autoClose: true,
      });

      setIsEditing(false);
      if (onProductUpdated) {
        onProductUpdated(updatedProduct);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await deleteProduct(product.id);

        addNotification({
          type: "success",
          message: "Product deleted successfully",
          autoClose: true,
        });

        onClose();
      } catch (error) {
        console.error("Error deleting product:", error);
        addNotification({
          type: "error",
          message: "Failed to delete product",
          autoClose: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStockAdjustment = (adjustment: number) => {
    const currentStock =
      typeof editForm.stock_quantity === "string"
        ? parseFloat(editForm.stock_quantity) || 0
        : editForm.stock_quantity;
    const newStock = Math.max(0, currentStock + adjustment);
    handleInputChange("stock_quantity", newStock.toString());
  };

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

  if (!isOpen || !product) return null;

  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">📦</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Product" : "Product Management"}
                </h2>
                <p className="text-sm text-gray-600">
                  {product.name} • ID: {product.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Edit Product
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "details", label: "Product Details", icon: "📋" },
              { id: "inventory", label: "Inventory", icon: "📊" },
              { id: "history", label: "Sales History", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {/* Product Details Tab */}
          {activeTab === "details" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name{" "}
                      {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <input
                        ref={firstInputRef}
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter product name"
                        required
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {product.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter product description"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {product.description || "No description"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {product.category_name ||
                          product.category ||
                          "No category"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.barcode}
                        onChange={(e) =>
                          handleInputChange("barcode", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter barcode"
                      />
                    ) : (
                      <p className="text-gray-900 font-mono">
                        {product.barcode || "No barcode"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing and Stock */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pricing & Stock
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium text-lg">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleStockAdjustment(-1)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stock_quantity}
                          onChange={(e) =>
                            handleInputChange("stock_quantity", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockAdjustment(1)}
                          className="px-3 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900 font-medium text-lg">
                          {product.stock_quantity}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                        >
                          {stockStatus.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleStockAdjustment(10)}
                        className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isEditing}
                      >
                        Add 10 Units
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStockAdjustment(50)}
                        className="w-full px-3 py-2 text-sm bg-green-100 text-green-600 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!isEditing}
                      >
                        Add 50 Units
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">
                    Current Stock
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {product.stock_quantity}
                  </p>
                  <p className="text-sm text-blue-700">units available</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900">
                    Stock Value
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {formatPrice(product.price * product.stock_quantity)}
                  </p>
                  <p className="text-sm text-green-700">total value</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900">
                    Unit Price
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-purple-700">per unit</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Stock Management
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    {
                      label: "Restock +100",
                      value: 100,
                      color: "bg-green-100 text-green-600 hover:bg-green-200",
                    },
                    {
                      label: "Restock +50",
                      value: 50,
                      color: "bg-green-100 text-green-600 hover:bg-green-200",
                    },
                    {
                      label: "Restock +25",
                      value: 25,
                      color: "bg-green-100 text-green-600 hover:bg-green-200",
                    },
                    {
                      label: "Restock +10",
                      value: 10,
                      color: "bg-green-100 text-green-600 hover:bg-green-200",
                    },
                    {
                      label: "Adjust -5",
                      value: -5,
                      color: "bg-red-100 text-red-600 hover:bg-red-200",
                    },
                    {
                      label: "Adjust -10",
                      value: -10,
                      color: "bg-red-100 text-red-600 hover:bg-red-200",
                    },
                    {
                      label: "Adjust -25",
                      value: -25,
                      color: "bg-red-100 text-red-600 hover:bg-red-200",
                    },
                    {
                      label: "Set to 0",
                      value: -product.stock_quantity,
                      color: "bg-red-100 text-red-600 hover:bg-red-200",
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => {
                        if (!isEditing) setIsEditing(true);
                        handleStockAdjustment(action.value);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sales History Tab */}
          {activeTab === "history" && (
            <div className="p-6 space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📈</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sales History
                </h3>
                <p className="text-gray-500">
                  Sales analytics and transaction history will be available here
                  once integrated with the sales system.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isLoading}
                  >
                    Delete Product
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit Product
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementModal;
