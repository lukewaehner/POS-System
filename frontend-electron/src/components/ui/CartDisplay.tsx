import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../../hooks/useCart";
import { CartItem } from "../../types/state";

interface CartDisplayProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  compact?: boolean;
  enableKeyboardShortcuts?: boolean;
  onProceedToCheckout?: () => void;
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
  isSelected = false,
  onSelect,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };

  const isOutOfStock = item.product.stock_quantity <= 0;
  const exceedsStock = item.quantity > item.product.stock_quantity;

  if (compact) {
    // Vertical/stacked layout for sidebar
    return (
      <div
        className={`p-3 bg-white border rounded-lg shadow-sm cursor-pointer transition-colors ${
          isSelected
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={onSelect}
      >
        {/* Top Row: Image + Product Info + Remove */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-gray-500 text-xs">IMG</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {item.product.name}
            </h3>
            <p className="text-xs text-gray-600">
              {formatPrice(item.product.price)} each
            </p>
            {exceedsStock && (
              <p className="text-red-600 text-xs font-medium">
                ⚠️ Only {item.product.stock_quantity} available
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.product.id);
            }}
            className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
            title="Remove from cart"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Bottom Row: Quantity Controls + Total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(-1);
              }}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-gray-600 font-bold text-sm">−</span>
            </button>

            <span className="font-semibold text-gray-900 min-w-6 text-center text-sm">
              {item.quantity}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(1);
              }}
              disabled={
                isOutOfStock || item.quantity >= item.product.stock_quantity
              }
              className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-gray-600 font-bold text-sm">+</span>
            </button>
          </div>

          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">
              {formatPrice(item.subtotal)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original horizontal layout for non-compact mode
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      {/* Product Image Placeholder */}
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-gray-500 text-xs">IMG</span>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate text-base">
          {item.product.name}
        </h3>
        <p className="text-gray-600 text-sm">
          {formatPrice(item.product.price)} each
        </p>
        {item.product.category && (
          <p className="text-gray-500 text-sm">{item.product.category}</p>
        )}
        {exceedsStock && (
          <p className="text-red-600 text-xs font-medium">
            ⚠️ Only {item.product.stock_quantity} available
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(-1)}
          disabled={item.quantity <= 1}
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-gray-600 font-bold text-lg">−</span>
        </button>

        <span className="font-semibold text-gray-900 min-w-8 text-center text-base">
          {item.quantity}
        </span>

        <button
          onClick={() => handleQuantityChange(1)}
          disabled={
            isOutOfStock || item.quantity >= item.product.stock_quantity
          }
          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-gray-600 font-bold text-lg">+</span>
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="font-bold text-gray-900 text-base">
          {formatPrice(item.subtotal)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.product.id)}
        className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
        title="Remove from cart"
      >
        <span className="text-lg">×</span>
      </button>
    </div>
  );
};

const CartDisplay: React.FC<CartDisplayProps> = ({
  className = "",
  showHeader = true,
  showFooter = true,
  compact = false,
  enableKeyboardShortcuts = true,
  onProceedToCheckout,
}) => {
  const {
    cartItems,
    cartSubtotal,
    cartTax,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
  } = useCart();

  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const cartRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const keystrokes = useRef<Array<{ key: string; timestamp: number }>>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const isEmpty = cartItems.length === 0;
  const itemCount = getCartItemCount();

  // Reset selection when cart changes
  useEffect(() => {
    if (selectedItemIndex >= cartItems.length) {
      setSelectedItemIndex(Math.max(0, cartItems.length - 1));
    }
  }, [cartItems.length, selectedItemIndex]);

  // Keyboard shortcut handlers
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle shortcuts if not focused or if modal/input is focused
    if (
      !isFocused ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Track rapid keystroke patterns to detect barcode scanner sequences
    const currentTime = Date.now();

    // Add current keystroke to tracking
    keystrokes.current.push({ key: event.key, timestamp: currentTime });

    // Clean up old keystrokes (older than 1 second)
    keystrokes.current = keystrokes.current.filter(
      (keystroke) => currentTime - keystroke.timestamp < 1000
    );

    // Check if this Enter key is part of a barcode scan sequence
    if (event.key === "Enter") {
      // Look for a rapid sequence of digits followed by Enter
      const recentDigits = keystrokes.current
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
            "🚫 CartDisplay: Ignoring Enter key from barcode scanner"
          );
          return;
        }
      }
    }

    switch (event.key) {
      case "Delete":
      case "Backspace":
        event.preventDefault();
        if (cartItems[selectedItemIndex]) {
          removeFromCart(cartItems[selectedItemIndex].product.id);
        }
        break;

      case "+":
      case "=":
        event.preventDefault();
        if (cartItems[selectedItemIndex]) {
          updateCartQuantity(
            cartItems[selectedItemIndex].product.id,
            cartItems[selectedItemIndex].quantity + 1
          );
        }
        break;

      case "-":
        event.preventDefault();
        if (cartItems[selectedItemIndex]) {
          updateCartQuantity(
            cartItems[selectedItemIndex].product.id,
            Math.max(1, cartItems[selectedItemIndex].quantity - 1)
          );
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        setSelectedItemIndex(Math.max(0, selectedItemIndex - 1));
        break;

      case "ArrowDown":
        event.preventDefault();
        setSelectedItemIndex(
          Math.min(cartItems.length - 1, selectedItemIndex + 1)
        );
        break;

      case "Enter":
        event.preventDefault();
        console.log("✅ CartDisplay: Processing manual Enter key for checkout");
        if (onProceedToCheckout) {
          onProceedToCheckout();
        }
        break;

      case "Home":
        event.preventDefault();
        setSelectedItemIndex(0);
        break;

      case "End":
        event.preventDefault();
        setSelectedItemIndex(cartItems.length - 1);
        break;

      case "c":
      case "C":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          clearCart();
        }
        break;
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    if (enableKeyboardShortcuts) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [enableKeyboardShortcuts, isFocused, selectedItemIndex, cartItems]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleItemSelect = (index: number) => {
    setSelectedItemIndex(index);
    if (cartRef.current) {
      cartRef.current.focus();
    }
  };

  if (isEmpty) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600">
          Add some products to get started with your order
        </p>
      </div>
    );
  }

  return (
    <div
      ref={cartRef}
      tabIndex={0}
      className={`bg-white rounded-lg shadow-sm border ${className} ${
        isFocused ? "ring-2 ring-blue-500 ring-opacity-50" : ""
      }`}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Shopping Cart
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            </h2>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {cartItems.map((item, index) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            compact={compact}
            isSelected={index === selectedItemIndex}
            onSelect={() => handleItemSelect(index)}
          />
        ))}
      </div>

      {/* Footer with Totals */}
      {showFooter && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax:</span>
              <span>{formatPrice(cartTax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          {enableKeyboardShortcuts && (
            <div className="mt-4 pt-3 border-t border-gray-300">
              <details className="group">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 flex items-center">
                  <span>⌨️ Keyboard Shortcuts</span>
                  <span className="ml-1 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        ↑↓
                      </span>{" "}
                      Navigate
                    </div>
                    <div>
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        Del
                      </span>{" "}
                      Remove
                    </div>
                    <div>
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        +/-
                      </span>{" "}
                      Quantity
                    </div>
                    <div>
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        Enter
                      </span>{" "}
                      Checkout
                    </div>
                    <div>
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        Home/End
                      </span>{" "}
                      First/Last
                    </div>
                    <div>
                      <span className="font-mono bg-gray-200 px-1 rounded">
                        Ctrl+C
                      </span>{" "}
                      Clear
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDisplay;
