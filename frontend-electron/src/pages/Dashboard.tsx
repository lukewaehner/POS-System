import React, { useEffect, useState } from "react";
import { useCart } from "../hooks/useCart";
import { useProducts } from "../hooks/useProducts";
import ProductSearch from "../components/ui/ProductSearch";
import QuickAddProducts from "../components/ui/QuickAddProducts";
import { CartDisplay } from "../components/ui";
import { Product } from "../services/productsService";

const Dashboard = () => {
  const { cartItems, cartTotal } = useCart();
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const { products, loadProducts } = useProducts();
  const [todaySales] = useState(0); // TODO: Connect to actual sales data
  const [todayTransactions] = useState(0); // TODO: Connect to actual transaction data

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Calculate low stock items
  const lowStockItems = products.filter(
    (product) => product.stock_quantity > 0 && product.stock_quantity <= 5
  ).length;

  const handleProductSelect = (product: Product) => {
    // Product search will handle adding to cart through its own logic
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">POS Terminal</h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Current Cart Summary */}
            {cartItemCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    🛒 {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xl font-bold text-blue-900">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Content Area */}
        <div className="flex-1 p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-2xl">💰</span>
                  </div>
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Today's Sales
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(todaySales)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-2xl">🛒</span>
                  </div>
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Transactions
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {todayTransactions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-600 text-2xl">⚠️</span>
                  </div>
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Low Stock Items
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {lowStockItems}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">🔍</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Product Search
                </h2>
              </div>
              <ProductSearch
                placeholder="Search products by name, category, or barcode..."
                onProductSelect={handleProductSelect}
                showAddToCart={true}
                maxResults={6}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Add Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-8">
              <QuickAddProducts maxRecentProducts={6} maxFavoriteProducts={9} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">⚡</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  className="flex items-center justify-center px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors"
                  onClick={() => {
                    // TODO: Navigate to checkout or process current cart
                    console.log("New Sale clicked");
                  }}
                >
                  <span className="mr-3 text-xl">🛒</span>
                  New Sale
                </button>
                <button
                  className="flex items-center justify-center px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                  onClick={() => {
                    // TODO: Navigate to products page
                    console.log("Product Lookup clicked");
                  }}
                >
                  <span className="mr-3 text-xl">📦</span>
                  Product Lookup
                </button>
                <button
                  className="flex items-center justify-center px-6 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-colors"
                  onClick={() => {
                    // TODO: Navigate to sales page
                    console.log("View Sales clicked");
                  }}
                >
                  <span className="mr-3 text-xl">📊</span>
                  View Sales
                </button>
                <button
                  className="flex items-center justify-center px-6 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-colors"
                  onClick={() => {
                    // TODO: Navigate to reports page
                    console.log("Reports clicked");
                  }}
                >
                  <span className="mr-3 text-xl">📈</span>
                  Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200">
          <div className="h-full flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Shopping Cart
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartDisplay
                showHeader={false}
                compact={true}
                className="h-full border-0 shadow-none rounded-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
