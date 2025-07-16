import React, { useState } from "react";
import ProductSearch from "./ui/ProductSearch";
import { Product } from "../services/productsService";
import { useCart } from "../hooks/useCart";

const ProductSearchDemo: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { cartItems } = useCart();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // Add to search history (avoid duplicates)
    setSearchHistory((prev) => {
      const newHistory = [
        product.name,
        ...prev.filter((name) => name !== product.name),
      ];
      return newHistory.slice(0, 5); // Keep only last 5 searches
    });
  };

  const clearSelection = () => {
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔍 Product Search Demo
        </h2>
        <p className="text-gray-600 mb-6">
          This demonstrates the fast product search with real-time autocomplete
          and advanced typo tolerance. Handles punctuation differences (space vs
          hyphen), character typos, and missing letters. Try "coca cola" to find
          "Coca-Cola".
        </p>

        {/* Search Features */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">✨ Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Real-time search</strong> with 150ms debounce
            </li>
            <li>
              • <strong>Advanced typo tolerance</strong> - handles character
              errors, punctuation differences (space ↔ hyphen), and missing
              letters
            </li>
            <li>
              • <strong>Multi-criteria search</strong> (name, category, barcode)
            </li>
            <li>
              • <strong>Keyboard navigation</strong> (↑↓ arrows, Enter to
              select)
            </li>
            <li>
              • <strong>Smart highlighting</strong> - yellow for exact, orange
              for fuzzy matches
            </li>
            <li>
              • <strong>Stock status</strong> indicators
            </li>
            <li>
              • <strong>One-click add to cart</strong> functionality
            </li>
          </ul>
        </div>

        {/* Search Component */}
        <ProductSearch
          placeholder="Try searching for 'Co', 'Soda', or scan a barcode..."
          onProductSelect={handleProductSelect}
          showAddToCart={true}
          maxResults={6}
          className="w-full"
        />

        {/* Search Examples */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Exact matches:</span>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "Co";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-700"
            >
              "Co" (Coca Cola)
            </button>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "Beverages";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-700"
            >
              "Beverages"
            </button>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "049000000443";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700"
            >
              "049000000443" (Barcode)
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">🔤 Typo tolerance:</span>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "coca cola";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-orange-700"
            >
              "coca cola" (space vs hyphen)
            </button>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "voca cola";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-orange-700"
            >
              "voca cola" (typo)
            </button>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "coc cola";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-orange-700"
            >
              "coc cola" (missing char)
            </button>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "cocacola";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-orange-700"
            >
              "cocacola" (no space)
            </button>
            <button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Try searching"]'
                ) as HTMLInputElement;
                if (input) {
                  input.value = "sniks";
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
              className="text-xs bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-orange-700"
            >
              "sniks" (snacks typo)
            </button>
          </div>
        </div>
      </div>

      {/* Selected Product Details */}
      {selectedProduct && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Product
            </h3>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 text-xl"
              title="Clear selection"
            >
              ×
            </button>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-900">
                {selectedProduct.name}
              </h4>
              <span className="text-lg font-bold text-green-900">
                {formatPrice(selectedProduct.price)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <span className="font-medium">Category:</span>{" "}
                {selectedProduct.category_name ||
                  selectedProduct.category ||
                  "N/A"}
              </div>
              <div>
                <span className="font-medium">Stock:</span>{" "}
                {selectedProduct.stock_quantity} units
              </div>
              {selectedProduct.barcode && (
                <div>
                  <span className="font-medium">Barcode:</span>{" "}
                  {selectedProduct.barcode}
                </div>
              )}
              <div>
                <span className="font-medium">Product ID:</span>{" "}
                {selectedProduct.id}
              </div>
            </div>

            {selectedProduct.description && (
              <div className="mt-3 text-sm text-green-700">
                <span className="font-medium">Description:</span>{" "}
                {selectedProduct.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((search, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {search}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cart Integration Status */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🛒 Cart Integration
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Products added via search are automatically added to cart:
          </p>
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              Current cart items: {cartItems.length}
            </span>
          </div>
          {cartItems.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Latest items:{" "}
              {cartItems
                .slice(-3)
                .map((item) => item.product.name)
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚡ Performance
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-900">Search Algorithm</div>
            <div className="text-blue-700">
              Multi-tier: Exact → Fuzzy → Levenshtein distance
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-900">Normalization</div>
            <div className="text-green-700">
              Punctuation → spaces, 60%+ similarity
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-900">Performance</div>
            <div className="text-purple-700">
              150ms debounce + local caching
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="font-medium text-orange-900">Scoring</div>
            <div className="text-orange-700">
              Weighted by match type & quality
            </div>
          </div>
        </div>
      </div>

      {/* Integration with Product Catalog */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔗 Full Product Catalog Integration
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                📦 Complete Product Management
              </h4>
              <p className="text-gray-600 mb-4">
                The ProductSearch component is fully integrated into our
                comprehensive Product Catalog page featuring grid/list views,
                advanced filtering, sorting, and seamless cart integration.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>
                    🔍 <strong>Advanced Search</strong> - Real-time autocomplete
                    with typo tolerance
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>
                    🎯 <strong>Smart Filtering</strong> - Category, stock
                    status, and custom sorting
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>
                    📱 <strong>Responsive Views</strong> - Grid and list layouts
                    for different use cases
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>
                    🛒 <strong>Cart Integration</strong> - One-click add to cart
                    with stock validation
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <div className="text-6xl opacity-20">📦</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              <strong>🎯 Perfect for POS environments:</strong> Fast product
              discovery combines search-as-you-type functionality with visual
              browsing for efficient cashier workflows.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>✅ Touch-friendly design</span>
              <span>✅ Keyboard shortcuts</span>
              <span>✅ Real-time stock updates</span>
              <span>✅ Category-based organization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchDemo;
