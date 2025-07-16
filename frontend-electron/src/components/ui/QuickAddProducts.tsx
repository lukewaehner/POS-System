import React, { useState, useEffect, useCallback } from "react";
import { Product } from "../../services/productsService";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";
import { useNotifications } from "../../hooks/useNotifications";

interface QuickAddProductsProps {
  className?: string;
  maxRecentProducts?: number;
  maxFavoriteProducts?: number;
}

interface QuantityModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add to Cart</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-500">
                {product.category_name || product.category || "No Category"}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">Stock Available:</span>
            <span
              className={`text-sm font-medium ${
                product.stock_quantity > 5
                  ? "text-green-600"
                  : product.stock_quantity > 0
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {product.stock_quantity} units
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              onKeyDown={handleKeyDown}
              className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max={product.stock_quantity}
            />
            <button
              onClick={() =>
                setQuantity(Math.min(product.stock_quantity, quantity + 1))
              }
              disabled={quantity >= product.stock_quantity}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Total: {formatPrice(product.price * quantity)}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              quantity > product.stock_quantity || product.stock_quantity === 0
            }
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickAddProducts: React.FC<QuickAddProductsProps> = ({
  className = "",
  maxRecentProducts = 8,
  maxFavoriteProducts = 12,
}) => {
  const { addToCart, canAddToCart, cartItems } = useCart();
  const { products } = useProducts();
  const { showSuccess, showError, showWarning } = useNotifications();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<Set<number>>(
    new Set()
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusedSection, setFocusedSection] = useState<
    "recent" | "popular" | null
  >(null);

  // Get recent products from cart history
  useEffect(() => {
    const getRecentProducts = () => {
      // Get unique products from current cart and recently added items
      const cartProductIds = cartItems.map((item) => item.product.id);

      // Get stored recent products from localStorage
      const storedRecent = localStorage.getItem("pos-recent-products");
      let recentProductIds: number[] = [];

      if (storedRecent) {
        try {
          recentProductIds = JSON.parse(storedRecent);
        } catch (error) {
          console.error("Error parsing recent products:", error);
        }
      }

      // Combine cart products with stored recent products
      const allRecentIds = Array.from(
        new Set([...cartProductIds, ...recentProductIds])
      );

      // Get actual product objects
      const recentProducts = allRecentIds
        .map((id) => products.find((p) => p.id === id))
        .filter((product): product is Product => product !== undefined)
        .slice(0, maxRecentProducts);

      setRecentProducts(recentProducts);
    };

    if (products.length > 0) {
      getRecentProducts();
    }
  }, [cartItems, products, maxRecentProducts]);

  // Get popular/favorite products (highest stock or frequently used categories)
  const favoriteProducts = React.useMemo(() => {
    return products
      .filter((product) => product.stock_quantity > 0)
      .sort((a, b) => {
        // Prioritize beverages and snacks (common POS categories)
        const categoryPriority = (product: Product) => {
          const category = (
            product.category_name ||
            product.category ||
            ""
          ).toLowerCase();
          if (category.includes("beverage") || category.includes("drink"))
            return 3;
          if (category.includes("snack") || category.includes("candy"))
            return 2;
          if (category.includes("tobacco") || category.includes("cigarette"))
            return 1;
          return 0;
        };

        const aPriority = categoryPriority(a);
        const bPriority = categoryPriority(b);

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        // Then by stock quantity (higher stock = more popular)
        return b.stock_quantity - a.stock_quantity;
      })
      .slice(0, maxFavoriteProducts);
  }, [products, maxFavoriteProducts]);

  // Enhanced error handling and loading states
  const handleQuickAdd = useCallback(
    async (product: Product) => {
      if (!canAddToCart(product)) {
        if (product.stock_quantity === 0) {
          showError(`${product.name} is out of stock!`);
        } else {
          showWarning(`Cannot add ${product.name} to cart`);
        }
        return;
      }

      setSelectedProduct(product);
      setModalOpen(true);
    },
    [canAddToCart, showError, showWarning]
  );

  const handleDirectAdd = useCallback(
    async (product: Product) => {
      if (!canAddToCart(product)) {
        if (product.stock_quantity === 0) {
          showError(`${product.name} is out of stock!`);
        } else {
          showWarning(`Cannot add ${product.name} to cart`);
        }
        return;
      }

      // Start loading state
      setLoadingProducts((prev) => new Set(prev).add(product.id));

      try {
        // Simulate brief loading for better UX feedback
        await new Promise((resolve) => setTimeout(resolve, 200));

        addToCart(product, 1);
        showSuccess(`Added ${product.name} to cart!`);

        // Update recent products in localStorage
        const storedRecent = localStorage.getItem("pos-recent-products");
        let recentIds: number[] = [];

        if (storedRecent) {
          try {
            recentIds = JSON.parse(storedRecent);
          } catch (error) {
            console.error("Error parsing recent products:", error);
          }
        }

        // Add to front of recent list
        recentIds = [
          product.id,
          ...recentIds.filter((id) => id !== product.id),
        ];
        recentIds = recentIds.slice(0, maxRecentProducts * 2); // Store more than we show

        localStorage.setItem("pos-recent-products", JSON.stringify(recentIds));
      } catch (error) {
        showError(`Failed to add ${product.name} to cart`);
      } finally {
        // Remove loading state
        setLoadingProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      }
    },
    [
      canAddToCart,
      addToCart,
      showSuccess,
      showError,
      showWarning,
      maxRecentProducts,
    ]
  );

  const handleModalConfirm = useCallback(
    async (quantity: number) => {
      if (selectedProduct && canAddToCart(selectedProduct)) {
        try {
          addToCart(selectedProduct, quantity);
          showSuccess(`Added ${quantity}x ${selectedProduct.name} to cart!`);

          // Update recent products
          const storedRecent = localStorage.getItem("pos-recent-products");
          let recentIds: number[] = [];

          if (storedRecent) {
            try {
              recentIds = JSON.parse(storedRecent);
            } catch (error) {
              console.error("Error parsing recent products:", error);
            }
          }

          recentIds = [
            selectedProduct.id,
            ...recentIds.filter((id) => id !== selectedProduct.id),
          ];
          recentIds = recentIds.slice(0, maxRecentProducts * 2);

          localStorage.setItem(
            "pos-recent-products",
            JSON.stringify(recentIds)
          );
        } catch (error) {
          showError(`Failed to add ${selectedProduct.name} to cart`);
        }
      }
    },
    [
      selectedProduct,
      canAddToCart,
      addToCart,
      showSuccess,
      showError,
      maxRecentProducts,
    ]
  );

  // Keyboard shortcuts
  useEffect(() => {
    // Track rapid keystroke patterns to detect barcode scanner sequences
    let recentKeystrokes: Array<{ key: string; timestamp: number }> = [];
    let cleanupTimeout: NodeJS.Timeout | null = null;

    const handleKeyPress = (e: KeyboardEvent) => {
      const currentTime = Date.now();

      // Don't handle shortcuts if modal is open or user is typing
      if (
        modalOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Track all keystrokes with timestamps
      recentKeystrokes.push({ key: e.key, timestamp: currentTime });

      // Clean up old keystrokes (older than 1 second)
      recentKeystrokes = recentKeystrokes.filter(
        (keystroke) => currentTime - keystroke.timestamp < 1000
      );

      // Set up cleanup timeout
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
      cleanupTimeout = setTimeout(() => {
        recentKeystrokes = [];
      }, 1000);

      // Check if this Enter key is part of a barcode scan sequence
      if (e.key === "Enter") {
        // Look for a rapid sequence of digits followed by Enter
        const recentDigits = recentKeystrokes
          .filter((k) => /[0-9]/.test(k.key))
          .slice(-15); // Look at last 15 digits max

        if (recentDigits.length >= 8) {
          // Minimum barcode length
          // Check if digits were entered rapidly (barcode scanner pattern)
          let isRapidSequence = true;
          for (let i = 1; i < recentDigits.length; i++) {
            const timeDiff =
              recentDigits[i].timestamp - recentDigits[i - 1].timestamp;
            if (timeDiff > 200) {
              // More than 200ms between digits = manual typing
              isRapidSequence = false;
              break;
            }
          }

          // If we detected a rapid digit sequence, ignore this Enter key
          if (isRapidSequence) {
            console.log(
              "🚫 QuickAddProducts: Ignoring Enter key from barcode scanner"
            );
            return;
          }
        }
      }

      const currentProducts =
        focusedSection === "recent" ? recentProducts : favoriteProducts;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(currentProducts.length - 1, prev + 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedSection("recent");
          setSelectedIndex(0);
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedSection("popular");
          setSelectedIndex(0);
          break;
        case "Enter":
          e.preventDefault();
          if (currentProducts[selectedIndex]) {
            console.log(
              "✅ QuickAddProducts: Processing manual Enter key for product:",
              currentProducts[selectedIndex].name
            );
            handleDirectAdd(currentProducts[selectedIndex]);
          }
          break;
        case " ":
          e.preventDefault();
          if (currentProducts[selectedIndex]) {
            handleQuickAdd(currentProducts[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusedSection(null);
          setSelectedIndex(0);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
    };
  }, [
    modalOpen,
    recentProducts,
    favoriteProducts,
    selectedIndex,
    focusedSection,
    handleDirectAdd,
    handleQuickAdd,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStockBadge = (product: Product) => {
    if (product.stock_quantity === 0) {
      return <span className="text-xs text-red-600 font-medium">Out</span>;
    } else if (product.stock_quantity <= 5) {
      return <span className="text-xs text-yellow-600 font-medium">Low</span>;
    }
    return null;
  };

  const isProductSelected = (
    product: Product,
    section: "recent" | "popular"
  ) => {
    if (focusedSection !== section) return false;
    const currentProducts =
      section === "recent" ? recentProducts : favoriteProducts;
    return currentProducts[selectedIndex]?.id === product.id;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Keyboard shortcuts helper */}
      {focusedSection && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-800">
            <span className="font-medium">Keyboard Mode Active:</span>
            ↑↓ Switch sections • ←→ Navigate • Enter Quick Add • Space Choose
            Qty • Esc Exit
          </div>
        </div>
      )}

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${
                focusedSection === "recent" ? "text-blue-600" : "text-gray-900"
              }`}
            >
              🕒 Recent Products
            </h3>
            <span className="text-sm text-gray-500">
              {recentProducts.length} item
              {recentProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentProducts.map((product, index) => (
              <div
                key={product.id}
                className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 w-full mx-auto cursor-pointer ${
                  isProductSelected(product, "recent")
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200"
                } ${!canAddToCart(product) ? "opacity-50" : ""}`}
                onClick={() => {
                  setFocusedSection("recent");
                  setSelectedIndex(index);
                }}
              >
                <div className="text-center w-full">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 relative">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h4
                    className="text-sm font-medium text-gray-900 truncate mb-2 text-center"
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {getStockBadge(product)}
                  </div>
                  <div className="text-xs text-gray-500 mb-3 text-center">
                    Stock: {product.stock_quantity}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectAdd(product);
                    }}
                    disabled={
                      !canAddToCart(product) || loadingProducts.has(product.id)
                    }
                    className="w-full text-xs bg-blue-500 text-white rounded px-2 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loadingProducts.has(product.id) ? (
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      "+ Add"
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(product);
                    }}
                    disabled={!canAddToCart(product)}
                    className="w-full text-xs bg-gray-100 text-gray-700 rounded px-2 py-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Qty
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular/Favorite Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${
              focusedSection === "popular" ? "text-blue-600" : "text-gray-900"
            }`}
          >
            ⭐ Popular Products
          </h3>
          <span className="text-sm text-gray-500">
            {favoriteProducts.length} item
            {favoriteProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product, index) => (
            <div
              key={product.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 w-full mx-auto cursor-pointer ${
                isProductSelected(product, "popular")
                  ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                  : "border-gray-200"
              } ${!canAddToCart(product) ? "opacity-50" : ""}`}
              onClick={() => {
                setFocusedSection("popular");
                setSelectedIndex(index);
              }}
            >
              <div className="text-center w-full">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 relative">
                  <span className="text-2xl">📦</span>
                </div>
                <h4
                  className="text-sm font-medium text-gray-900 truncate mb-2 text-center"
                  title={product.name}
                >
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 truncate mb-2 text-center">
                  {product.category_name || product.category || "No Category"}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {getStockBadge(product)}
                </div>
                <div className="text-xs text-gray-600 mb-3 text-center">
                  Stock:{" "}
                  <span className="font-medium">{product.stock_quantity}</span>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectAdd(product);
                  }}
                  disabled={
                    !canAddToCart(product) || loadingProducts.has(product.id)
                  }
                  className="w-full text-sm bg-blue-500 text-white rounded-lg px-3 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                >
                  {loadingProducts.has(product.id) ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    "Quick Add"
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd(product);
                  }}
                  disabled={!canAddToCart(product)}
                  className="w-full text-sm bg-gray-100 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Choose Quantity
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity Selection Modal */}
      <QuantityModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default QuickAddProducts;
