import React, { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { useProducts } from "../hooks/useProducts";
import { useNotifications } from "../hooks/useNotifications";
import useBarcodeScanner from "../hooks/useBarcodeScanner";
import QuickAddProductModal from "../components/ui/QuickAddProductModal";
import { Product, ProductsService } from "../services/productsService";

interface Category {
  id: number;
  name: string;
  description?: string;
  product_count: number;
}

// Category Modal Component
const CategoryModal: React.FC<{
  isOpen: boolean;
  category: string;
  products: Product[];
  onClose: () => void;
  onProductSelect: (product: Product) => void;
}> = ({ isOpen, category, products, onClose, onProductSelect }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh]">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {currentProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onProductSelect(product);
                  onClose();
                }}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors min-h-[120px] flex flex-col justify-between"
              >
                <div className="text-3xl mb-2">📦</div>
                <div className="text-sm font-medium text-gray-900 text-center mb-1">
                  {product.name}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                <div className="text-xs text-gray-500">
                  Stock: {product.stock_quantity}
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-12 h-12 rounded-lg font-bold ${
                    i === currentPage
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {currentPage < totalPages - 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700"
                >
                  ▶
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  item: any;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, item, onClose, onConfirm }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Item?</h3>
          <p className="text-gray-600 mb-6">
            Remove <strong>{item.product.name}</strong> from your cart?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Quantity Modal Component with Number Pad
const QuickQuantityModal: React.FC<{
  isOpen: boolean;
  product: Product;
  currentQuantity: number;
  onClose: () => void;
  onQuantityChange: (quantity: number) => void;
}> = ({ isOpen, product, currentQuantity, onClose, onQuantityChange }) => {
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuantity(currentQuantity.toString());
    }
  }, [isOpen, currentQuantity]);

  const handleNumberClick = (number: string) => {
    if (number === "C") {
      setQuantity("");
    } else if (number === "✓") {
      const newQuantity = parseInt(quantity) || 0;
      onQuantityChange(newQuantity);
      onClose();
    } else {
      if (quantity.length < 3) {
        // Limit to 3 digits
        setQuantity(quantity + number);
      }
    }
  };

  if (!isOpen) return null;

  const numberPad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "✓"],
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-sm w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-6">Enter Quantity</p>

          {/* Quantity Display */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
            <div className="text-3xl font-bold text-gray-900 min-h-[1.5em]">
              {quantity || "0"}
            </div>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {numberPad.map((row, rowIndex) =>
              row.map((number, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleNumberClick(number)}
                  className={`h-16 rounded-lg font-bold text-xl transition-colors ${
                    number === "C"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : number === "✓"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  {number}
                </button>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const newQuantity = parseInt(quantity) || 0;
                onQuantityChange(newQuantity);
                onClose();
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CartItem Component with Click-Based Controls
const CartItem: React.FC<{
  item: any;
  isLastScanned: boolean;
  onQuantityClick: () => void;
  onQuantityChange: (change: number) => void;
  onDelete: () => void;
  formatPrice: (price: number) => string;
}> = ({
  item,
  isLastScanned,
  onQuantityClick,
  onQuantityChange,
  onDelete,
  formatPrice,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (change: number) => {
    if (isUpdating) return;

    setIsUpdating(true);

    // Debounce rapid clicking
    setTimeout(() => {
      onQuantityChange(change);
      setIsUpdating(false);
    }, 150);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`relative px-3 py-2 border-b border-gray-200 transition-all duration-200 select-none ${
        isLastScanned
          ? "bg-green-50 border-green-200 shadow-sm"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Single Horizontal Row Layout */}
      <div className="flex items-center justify-between space-x-3">
        {/* Left: Delete Button */}
        <button
          onClick={handleDelete}
          className="w-7 h-7 bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-95 text-white rounded-lg flex items-center justify-center transition-all duration-150 shadow-sm cursor-pointer flex-shrink-0"
          aria-label="Remove item"
        >
          <span className="text-sm pointer-events-none">🗑️</span>
        </button>

        {/* Center: Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-base leading-tight mb-0.5 cursor-default truncate">
            {item.product.name}
          </h3>
          <p className="text-xs text-gray-600 flex items-center cursor-default">
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2">
              {item.product.category_name || "General"}
            </span>
            <span className="text-gray-500">•</span>
            <span className="font-medium ml-2">
              {formatPrice(item.product.price)}
            </span>
            <span className="text-gray-500 ml-1">each</span>
          </p>
        </div>

        {/* Right: Quantity Controls & Price */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Decrease Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(-1);
            }}
            disabled={isUpdating || item.quantity <= 1}
            className="w-7 h-7 bg-white border border-red-300 hover:border-red-400 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded flex items-center justify-center text-sm font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-red-600 pointer-events-none">−</span>
          </button>

          {/* Quantity Display (Clickable) */}
          <button
            onClick={onQuantityClick}
            className="flex items-center justify-center px-2 py-1 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 active:scale-95 rounded transition-all duration-150 min-w-[32px] cursor-pointer"
          >
            <span className="text-sm font-bold text-blue-900 pointer-events-none">
              {item.quantity}
            </span>
          </button>

          {/* Increase Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuantityChange(1);
            }}
            disabled={isUpdating}
            className="w-7 h-7 bg-white border border-green-300 hover:border-green-400 hover:bg-green-50 active:bg-green-100 active:scale-95 rounded flex items-center justify-center text-sm font-bold transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            <span className="text-green-600 pointer-events-none">+</span>
          </button>

          {/* Total Price */}
          <div className="text-right min-w-[60px]">
            <p className="text-base font-bold text-gray-900 font-mono cursor-default leading-tight">
              {formatPrice(item.subtotal)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-gray-500 cursor-default leading-tight">
                {item.quantity} × {formatPrice(item.product.price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hamburger Menu Component

const Checkout = () => {
  const {
    cartItems,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    canAddToCart,
    clearCart,
  } = useCart();

  const { products, loadProducts, getProductByBarcode } = useProducts();

  const { addNotification } = useNotifications();

  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<any>(null);
  const [lastScannedItem, setLastScannedItem] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Cart pagination state
  const [currentCartPage, setCurrentCartPage] = useState(0);
  const [cartContainerHeight, setCartContainerHeight] = useState(0);
  const [itemHeight, setItemHeight] = useState(60); // Estimated height per item in pixels (compact layout)

  // Calculate dynamic items per page based on available height
  const itemsPerCartPage = Math.max(
    1,
    Math.floor(cartContainerHeight / itemHeight)
  );

  // Refs for height measurement
  const cartContainerRef = React.useRef<HTMLDivElement>(null);
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Removed scrollbar styles since we're using pagination instead

  // Load products and categories on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard shortcuts when modals are open
      if (
        quantityModalOpen ||
        categoryModalOpen ||
        quickAddModalOpen ||
        deleteConfirmOpen
      ) {
        return;
      }

      // Handle global keyboard shortcuts
      if (event.key === "Escape") {
        setSelectedItemId(null);
      }
      // Handle Delete key to remove last selected item
      else if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedItemId) {
          const selectedItem = cartItems.find(
            (item) => item.product.id === selectedItemId
          );
          if (selectedItem) {
            setItemToDelete(selectedItem);
            setDeleteConfirmOpen(true);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedItemId,
    quantityModalOpen,
    categoryModalOpen,
    quickAddModalOpen,
    deleteConfirmOpen,
    cartItems,
  ]);

  // Load categories from API
  const loadCategories = async () => {
    try {
      const response = await ProductsService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      addNotification({
        type: "error",
        message: "Failed to load categories",
        autoClose: true,
      });
    }
  };

  // Get products for selected category
  const categoryProducts = products.filter(
    (product) =>
      (product.category_name || product.category) === selectedCategory
  );

  // Get category display info
  const getCategoryDisplayInfo = (categoryName: string) => {
    const emojiMap: { [key: string]: string } = {
      "Food & Beverages": "🍕",
      "Health & Beauty": "💊",
      Household: "🧻",
      Electronics: "📱",
      Clothing: "👕",
      Automotive: "🚗",
      "Office Supplies": "📋",
      "Sports & Outdoors": "⚽",
      Books: "📚",
      "Toys & Games": "🎮",
      "Home & Garden": "🏠",
      "Beauty & Personal Care": "💄",
      "Pet Supplies": "🐕",
      "Baby & Kids": "👶",
      "Jewelry & Watches": "💍",
      "Music & Movies": "🎵",
    };

    const colorMap: { [key: string]: string } = {
      "Food & Beverages": "bg-orange-100 hover:bg-orange-200 text-orange-800",
      "Health & Beauty": "bg-green-100 hover:bg-green-200 text-green-800",
      Household: "bg-blue-100 hover:bg-blue-200 text-blue-800",
      Electronics: "bg-purple-100 hover:bg-purple-200 text-purple-800",
      Clothing: "bg-pink-100 hover:bg-pink-200 text-pink-800",
      Automotive: "bg-gray-100 hover:bg-gray-200 text-gray-800",
      "Office Supplies": "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
      "Sports & Outdoors": "bg-teal-100 hover:bg-teal-200 text-teal-800",
      Books: "bg-indigo-100 hover:bg-indigo-200 text-indigo-800",
      "Toys & Games": "bg-red-100 hover:bg-red-200 text-red-800",
      "Home & Garden": "bg-emerald-100 hover:bg-emerald-200 text-emerald-800",
      "Beauty & Personal Care": "bg-rose-100 hover:bg-rose-200 text-rose-800",
      "Pet Supplies": "bg-amber-100 hover:bg-amber-200 text-amber-800",
      "Baby & Kids": "bg-cyan-100 hover:bg-cyan-200 text-cyan-800",
      "Jewelry & Watches": "bg-violet-100 hover:bg-violet-200 text-violet-800",
      "Music & Movies": "bg-lime-100 hover:bg-lime-200 text-lime-800",
    };

    return {
      emoji: emojiMap[categoryName] || "📦",
      color:
        colorMap[categoryName] || "bg-gray-100 hover:bg-gray-200 text-gray-800",
    };
  };

  // Calculate grid columns based on number of categories
  const getGridColumns = (count: number) => {
    if (count <= 3) return "grid-cols-3";
    if (count <= 4) return "grid-cols-4";
    if (count <= 6) return "grid-cols-3";
    if (count <= 8) return "grid-cols-4";
    if (count <= 9) return "grid-cols-3";
    if (count <= 12) return "grid-cols-4";
    return "grid-cols-4"; // Default for many categories
  };

  // Quick access items (most common products)
  const quickItems = [
    { name: "Water", price: 1.25, emoji: "💧" },
    { name: "Coke", price: 2.0, emoji: "🥤" },
    { name: "Cigarettes", price: 8.25, emoji: "🚬" },
  ];

  // Barcode scanner integration
  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const product = await getProductByBarcode(barcode);

      if (product) {
        if (canAddToCart(product)) {
          addToCart(product, 1);
          setLastScannedItem(product);

          // Clear the highlight after 2 seconds
          setTimeout(() => setLastScannedItem(null), 2000);

          // Audio feedback (if available)
          try {
            const audio = new Audio(
              "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmshBz6X1O/Eezg"
            );
            audio.play().catch(() => {}); // Ignore audio errors
          } catch (e) {}

          addNotification({
            type: "success",
            message: `Added ${product.name}`,
            autoClose: true,
          });
        } else {
          addNotification({
            type: "error",
            message: `Cannot add ${product.name} - insufficient stock`,
            autoClose: true,
          });
        }
      } else {
        setScannedBarcode(barcode);
        setQuickAddModalOpen(true);
      }
    } catch (error) {
      console.error("🚨 [Checkout] Error processing barcode:", error);
      addNotification({
        type: "error",
        message: "Error processing barcode scan",
        autoClose: true,
      });
    }
  };

  const barcodeScanner = useBarcodeScanner({
    onBarcodeScanned: handleBarcodeScanned,
    onError: (error) => {
      addNotification({
        type: "error",
        message: `Scanner error: ${error}`,
        autoClose: true,
      });
    },
    minBarcodeLength: 8,
    maxBarcodeLength: 20,
    enableLogging: process.env.NODE_ENV === "development",
    preventDefaultKeyEvents: true,
  });

  const handleProductAdded = (product: Product) => {
    if (canAddToCart(product)) {
      addToCart(product, 1);
      addNotification({
        type: "success",
        message: `Added ${product.name}`,
        autoClose: true,
      });
    }
    setQuickAddModalOpen(false);
    setScannedBarcode("");
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCategoryModalOpen(true);
  };

  const handleProductSelect = (product: Product) => {
    if (canAddToCart(product)) {
      addToCart(product, 1);
      addNotification({
        type: "success",
        message: `Added ${product.name}`,
        autoClose: true,
      });
    }
  };

  const handleCartItemClick = (item: any) => {
    // Direct tap opens quantity modal
    setSelectedCartItem(item);
    setQuantityModalOpen(true);
  };

  const handleItemDelete = (item: any) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.product.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleQuantityChange = (quantity: number) => {
    if (selectedCartItem) {
      if (quantity === 0) {
        removeFromCart(selectedCartItem.product.id);
      } else {
        updateCartQuantity(selectedCartItem.product.id, quantity);
      }
    }
    setSelectedItemId(null); // Clear selection after update
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return date;
  };

  const hasItems = cartItems.length > 0;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Cart pagination calculations
  const totalCartPages = Math.ceil(cartItems.length / itemsPerCartPage);
  const currentCartItems = cartItems.slice(
    currentCartPage * itemsPerCartPage,
    (currentCartPage + 1) * itemsPerCartPage
  );

  // Only show pagination if there are more items than can fit in the available space
  const shouldShowPagination =
    cartItems.length > itemsPerCartPage && cartContainerHeight > 0;

  // Reset to first page when items are added/removed and current page is out of bounds
  React.useEffect(() => {
    if (currentCartPage >= totalCartPages && totalCartPages > 0) {
      setCurrentCartPage(0);
    }
  }, [cartItems.length, currentCartPage, totalCartPages]);

  // Measure container and item heights for dynamic pagination
  React.useEffect(() => {
    const measureHeights = () => {
      if (cartContainerRef.current) {
        const containerHeight = cartContainerRef.current.clientHeight;
        setCartContainerHeight(containerHeight);
      }

      if (itemRef.current) {
        const measuredItemHeight = itemRef.current.offsetHeight;
        setItemHeight(measuredItemHeight);
      }
    };

    measureHeights();

    // Remeasure on window resize
    window.addEventListener("resize", measureHeights);
    return () => window.removeEventListener("resize", measureHeights);
  }, [cartItems.length]);

  const handleCartPageChange = (page: number) => {
    setCurrentCartPage(page);
  };

  const handleVoidTransaction = () => {
    if (hasItems && window.confirm("Void entire transaction?")) {
      clearCart();
      addNotification({
        type: "info",
        message: "Transaction voided",
        autoClose: true,
      });
    }
  };

  const handlePayment = (method: string) => {
    if (hasItems) {
      alert(`${method} payment coming soon!`);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Main Content - Set explicit height */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-2 p-2 overflow-hidden"
        style={{ height: "calc(100vh - 120px)" }}
      >
        {/* Left Panel - Categories & Quick Items */}
        <div className="lg:col-span-3 flex flex-col space-y-2 overflow-hidden">
          {/* Categories */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categories
            </h2>
            <div className={`grid ${getGridColumns(categories.length)} gap-3`}>
              {categories.map((category) => {
                const displayInfo = getCategoryDisplayInfo(category.name);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`${displayInfo.color} p-4 rounded-lg text-center transition-colors min-h-[80px] flex flex-col items-center justify-center`}
                  >
                    <div className="text-2xl mb-1">{displayInfo.emoji}</div>
                    <div className="text-sm font-medium">
                      {category.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {category.product_count} items
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Items
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {quickItems.map((item, index) => (
                <button
                  key={index}
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors min-h-[80px] flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Current Sale */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-lg border border-gray-200 h-full overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Current Sale ({totalItems} items)
                {shouldShowPagination && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    • Page {currentCartPage + 1}/{totalCartPages}
                  </span>
                )}
              </h2>
              {/* Debug: Add many items button for testing scrolling */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() => {
                    // Add test items to trigger pagination
                    for (let i = 0; i < 15; i++) {
                      const testProduct = {
                        id: Date.now() + i,
                        name: `Test Item ${i + 1}`,
                        price: Math.random() * 10 + 1,
                        stock_quantity: 100,
                        category_name: "Test",
                      };
                      addToCart(testProduct, 1);
                    }
                  }}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Add Test Items (Pagination)
                </button>
              )}
            </div>
          </div>

          {/* Cart Items - Scrollable */}
          <div
            ref={cartContainerRef}
            className="flex-1 overflow-hidden min-h-0"
          >
            {cartItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8 select-none">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-lg">No items in cart</p>
                  <p className="text-sm mt-2">Scan or tap categories to add</p>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs mt-4 text-blue-600">
                      Click "Add Test Items (Pagination)" to test dynamic
                      pagination
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {currentCartItems.map((item, index) => (
                    <div
                      key={item.product.id}
                      ref={index === 0 ? itemRef : null}
                    >
                      <CartItem
                        item={item}
                        isLastScanned={lastScannedItem?.id === item.product.id}
                        onQuantityClick={() => handleCartItemClick(item)}
                        onQuantityChange={(change) => {
                          const newQuantity = Math.max(
                            0,
                            item.quantity + change
                          );
                          if (newQuantity === 0) {
                            removeFromCart(item.product.id);
                          } else {
                            updateCartQuantity(item.product.id, newQuantity);
                          }
                        }}
                        onDelete={() => handleItemDelete(item)}
                        formatPrice={formatPrice}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart Pagination - Outside scrollable area */}
          {shouldShowPagination && (
            <div className="p-3 bg-gray-100 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Page {currentCartPage + 1} of {totalCartPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCartPageChange(currentCartPage - 1)}
                    disabled={currentCartPage === 0}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ◀
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalCartPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handleCartPageChange(i)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
                        i === currentCartPage
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handleCartPageChange(currentCartPage + 1)}
                    disabled={currentCartPage === totalCartPages - 1}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Totals - Always Visible */}
          {hasItems && (
            <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Tax:</span>
                  <span className="font-mono">{formatCurrency(cartTax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-xl font-bold">TOTAL:</span>
                  <span className="text-3xl font-bold text-green-600 font-mono">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePayment("Cash")}
                  className="flex flex-col items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[60px]"
                >
                  <span className="text-xl">💵</span>
                  <span className="text-sm font-medium">CASH</span>
                </button>
                <button
                  onClick={() => handlePayment("Card")}
                  className="flex flex-col items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[60px]"
                >
                  <span className="text-xl">💳</span>
                  <span className="text-sm font-medium">CARD</span>
                </button>
                <button
                  onClick={() => handlePayment("Other")}
                  className="flex flex-col items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[60px]"
                >
                  <span className="text-xl">🎯</span>
                  <span className="text-sm font-medium">OTHER</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Bottom Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0 h-12">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            Session: {new Date().toLocaleTimeString()}
          </span>
          {barcodeScanner.scanCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {barcodeScanner.scanCount} scans
            </span>
          )}
        </div>

        <button
          onClick={handleVoidTransaction}
          disabled={!hasItems}
          className="px-4 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          Void Transaction
        </button>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={categoryModalOpen}
        category={selectedCategory}
        products={categoryProducts}
        onClose={() => setCategoryModalOpen(false)}
        onProductSelect={handleProductSelect}
      />

      <QuickQuantityModal
        isOpen={quantityModalOpen}
        product={selectedCartItem?.product}
        currentQuantity={selectedCartItem?.quantity || 0}
        onClose={() => {
          setQuantityModalOpen(false);
          setSelectedItemId(null);
        }}
        onQuantityChange={handleQuantityChange}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        item={itemToDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <QuickAddProductModal
        isOpen={quickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        scannedBarcode={scannedBarcode}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default Checkout;
