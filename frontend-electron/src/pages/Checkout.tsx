import React from "react";

const Checkout = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Search and Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Product Search
          </h2>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Scan barcode or search product..."
                className="input-field"
              />
            </div>
            <button className="btn-primary">📱 Scan</button>
          </div>
        </div>

        {/* Quick Products Grid */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Add Products
          </h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <p className="text-gray-500">
              Product catalog will appear here for quick selection
            </p>
          </div>
        </div>
      </div>

      {/* Shopping Cart and Payment */}
      <div className="space-y-6">
        {/* Shopping Cart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Shopping Cart
          </h2>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🛒</div>
            <p className="text-gray-500 mb-4">Cart is empty</p>
            <p className="text-sm text-gray-400">
              Scan or search for products to add them to the cart
            </p>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>$0.00</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Method
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-primary" disabled>
              💳 Pay with Card
            </button>
            <button className="w-full btn-secondary" disabled>
              💵 Cash Payment
            </button>
            <button className="w-full btn-secondary text-sm">
              🧾 Save for Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
