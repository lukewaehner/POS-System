import React, { useState } from "react";
import { useCart } from "../hooks/useCart";
import { Product } from "../services/productsService";

const CartValidationDemo: React.FC = () => {
  const {
    cartItems,
    cartTotal,
    addToCartWithValidation,
    validateCurrentCart,
    getMaxQuantity,
    canAddToCart,
    getCartValidationErrors,
    getCartValidationWarnings,
    clearCart,
  } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Sample products for testing validation
  const testProducts: Product[] = [
    {
      id: 1,
      name: "Valid Product",
      price: 9.99,
      stock_quantity: 50,
      barcode: "123456789012",
      category: "Test",
      tax_rate: 0.08,
    },
    {
      id: 2,
      name: "Low Stock Product",
      price: 5.99,
      stock_quantity: 2,
      barcode: "123456789013",
      category: "Test",
      tax_rate: 0.08,
    },
    {
      id: 3,
      name: "Out of Stock Product",
      price: 15.99,
      stock_quantity: 0,
      barcode: "123456789014",
      category: "Test",
      tax_rate: 0.08,
    },
    {
      id: 4,
      name: "Free Product",
      price: 0,
      stock_quantity: 10,
      barcode: "123456789015",
      category: "Test",
      tax_rate: 0.08,
    },
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCartWithValidation(selectedProduct, quantity);
    }
  };

  const cartValidation = validateCurrentCart();
  const errors = getCartValidationErrors();
  const warnings = getCartValidationWarnings();

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Test Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedProduct?.id === product.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-600">
                ${product.price.toFixed(2)} - Stock: {product.stock_quantity}
              </p>
              {product.stock_quantity === 0 && (
                <span className="text-red-600 text-xs font-medium">
                  Out of Stock
                </span>
              )}
              {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                <span className="text-yellow-600 text-xs font-medium">
                  Low Stock
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart Controls */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Add "{selectedProduct.name}" to Cart
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={getMaxQuantity(selectedProduct)}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= getMaxQuantity(selectedProduct)}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Max: {getMaxQuantity(selectedProduct)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart(selectedProduct, quantity)}
                className="btn-primary disabled:opacity-50"
              >
                Add to Cart
              </button>
              <span className="text-sm">
                {canAddToCart(selectedProduct, quantity) ? (
                  <span className="text-green-600">✓ Can add to cart</span>
                ) : (
                  <span className="text-red-600">✗ Cannot add to cart</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cart Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cart Status</h3>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Items in cart:</span>
            <span>{cartItems.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cart total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cart valid:</span>
            <span
              className={
                cartValidation.isValid ? "text-green-600" : "text-red-600"
              }
            >
              {cartValidation.isValid ? "✓ Valid" : "✗ Invalid"}
            </span>
          </div>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Warnings */}
        {warnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Validation Warnings:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Persistence Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Cart Persistence Demo</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Your cart is automatically saved to localStorage and will persist
            between page refreshes.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              Refresh Page (Test Persistence)
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("pos-cart");
                window.location.reload();
              }}
              className="btn-secondary text-sm"
            >
              Clear Saved Cart & Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts Demo</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add items to your cart above, then click on the cart below to focus
            it and try these keyboard shortcuts:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">Navigation</div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">↑↓</span>{" "}
                Move between items
              </div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">
                  Home/End
                </span>{" "}
                First/Last item
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">Quantity</div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">+</span>{" "}
                Increase quantity
              </div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">-</span>{" "}
                Decrease quantity
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">Actions</div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">Del</span>{" "}
                Remove item
              </div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">
                  Enter
                </span>{" "}
                Checkout
              </div>
              <div className="text-gray-600">
                <span className="font-mono bg-gray-200 px-1 rounded">
                  Ctrl+C
                </span>{" "}
                Clear cart
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Click on the cart items below to focus
              the cart, then use keyboard shortcuts for fast navigation and
              editing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartValidationDemo;
