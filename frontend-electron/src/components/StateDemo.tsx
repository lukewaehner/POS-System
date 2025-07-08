import React from "react";
import { useCart, useProducts, useAuth, useNotifications } from "../hooks";

const StateDemo: React.FC = () => {
  const {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
    getCartItemCount,
  } = useCart();

  const {
    products,
    isLoading: productsLoading,
    loadProducts,
    searchProducts,
  } = useProducts();

  const { isAuthenticated, userName, login, logout } = useAuth();

  const { notifications, showSuccess, showError, showInfo } =
    useNotifications();

  const handleDemoLogin = () => {
    login({
      id: 1,
      name: "Demo User",
      role: "cashier",
    });
  };

  const handleAddRandomProduct = () => {
    if (products.length > 0) {
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      addToCart(randomProduct, 1);
    } else {
      showError("No products available. Load products first.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">State Management Demo</h1>

      {/* Authentication Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Status:{" "}
            {isAuthenticated ? `Logged in as ${userName}` : "Not logged in"}
          </span>
          {!isAuthenticated ? (
            <button
              onClick={handleDemoLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Demo Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => loadProducts(true)}
            disabled={productsLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {productsLoading ? "Loading..." : "Load Products"}
          </button>
          <button
            onClick={() => searchProducts("Coca")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search "Coca"
          </button>
          <span className="text-gray-600">
            Found: {products.length} products
          </span>
        </div>

        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="border rounded p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <button
                  onClick={() => addToCart(product, 1)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Shopping Cart ({getCartItemCount()} items)
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleAddRandomProduct}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Add Random Product
          </button>
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Cart
          </button>
          <span className="text-gray-600 font-medium">
            Total: ${cartTotal.toFixed(2)}
          </span>
        </div>

        {cartItems.length > 0 ? (
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    ${item.subtotal.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Cart is empty</p>
        )}
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => showSuccess("This is a success message!")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Show Success
          </button>
          <button
            onClick={() => showError("This is an error message!")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Show Error
          </button>
          <button
            onClick={() => showInfo("This is an info message!")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Show Info
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Active Notifications:</h3>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : notification.type === "error"
                    ? "bg-red-100 text-red-800"
                    : notification.type === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateDemo;
