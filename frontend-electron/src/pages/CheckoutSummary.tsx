import React, { useState } from "react";
import { useCart } from "../hooks/useCart";
import { useNotifications } from "../hooks/useNotifications";
import { PaymentProcessingModal, PaymentStatus } from "../components/ui";

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

type PaymentMethodSelection = "cash" | "card" | "saved";
type PaymentMethod = "cash" | "card" | "other";

const CheckoutSummary: React.FC = () => {
  const { cartItems, cartSubtotal, cartTax, cartTotal, clearCart } = useCart();
  const { showSuccess, showError } = useNotifications();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodSelection | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("selecting");
  const [cashReceived, setCashReceived] = useState<number>(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const change = cashReceived - cartTotal;
  const hasItems = cartItems.length > 0;
  const canProceed = hasItems && selectedPaymentMethod;

  const handleCustomerInfoChange = (
    field: keyof CustomerInfo,
    value: string
  ) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodSelect = (method: PaymentMethodSelection) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceedToPayment = () => {
    if (!canProceed) return;

    if (selectedPaymentMethod === "cash") {
      // For cash payments, we need to collect the cash amount
      setPaymentModalOpen(true);
      setPaymentStatus("processing");
      simulateCashPayment();
    } else if (selectedPaymentMethod === "card") {
      // For card payments, proceed directly
      setPaymentModalOpen(true);
      setPaymentStatus("processing");
      simulateCardPayment();
    }
  };

  const simulateCashPayment = () => {
    // Simulate cash payment processing
    setTimeout(() => {
      setPaymentStatus("success");
      showSuccess("Cash payment completed successfully!");
    }, 2000);
  };

  const simulateCardPayment = () => {
    // Simulate card payment processing
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      if (success) {
        setPaymentStatus("success");
        showSuccess("Card payment completed successfully!");
      } else {
        setPaymentStatus("failed");
        showError("Card payment failed. Please try again.");
      }
    }, 3000);
  };

  const handlePaymentComplete = () => {
    if (paymentStatus === "success") {
      // Clear cart and reset state
      clearCart();
      setCustomerInfo({});
      setSelectedPaymentMethod(null);
      setCashReceived(0);
      setPaymentModalOpen(false);
      setPaymentStatus("selecting");
      showSuccess("Transaction completed! Receipt printed.");
    } else {
      setPaymentModalOpen(false);
      setPaymentStatus("selecting");
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus("processing");
    if (selectedPaymentMethod === "cash") {
      simulateCashPayment();
    } else {
      simulateCardPayment();
    }
  };

  // Redirect to main checkout if no items
  if (!hasItems) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Items in Cart
          </h2>
          <p className="text-gray-500 mb-6">
            Add some items to your cart before proceeding to checkout.
          </p>
          <button onClick={() => window.history.back()} className="btn-primary">
            ← Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout Summary</h1>
          <p className="text-gray-600 mt-1">
            Review your order and complete your purchase
          </p>
        </div>
        <button onClick={() => window.history.back()} className="btn-secondary">
          ← Back to Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cart Review & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Final Cart Review */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Review
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.product.price)} each
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(item.subtotal)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatPrice(cartTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information (Optional) */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer Information
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Optional)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerInfo.name || ""}
                  onChange={(e) =>
                    handleCustomerInfoChange("name", e.target.value)
                  }
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone || ""}
                  onChange={(e) =>
                    handleCustomerInfoChange("phone", e.target.value)
                  }
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerInfo.email || ""}
                  onChange={(e) =>
                    handleCustomerInfoChange("email", e.target.value)
                  }
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Customer information is optional and used for receipts and
              follow-up communications.
            </p>
          </div>
        </div>

        {/* Right Column: Payment Method Selection */}
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              {/* Cash Payment */}
              <button
                onClick={() => handlePaymentMethodSelect("cash")}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedPaymentMethod === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💵</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Cash Payment
                    </div>
                    <div className="text-sm text-gray-500">
                      Pay with cash, receive change
                    </div>
                  </div>
                  {selectedPaymentMethod === "cash" && (
                    <div className="ml-auto text-blue-500">✓</div>
                  )}
                </div>
              </button>

              {/* Card Payment */}
              <button
                onClick={() => handlePaymentMethodSelect("card")}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedPaymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💳</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Card Payment
                    </div>
                    <div className="text-sm text-gray-500">
                      Credit, debit, or contactless
                    </div>
                  </div>
                  {selectedPaymentMethod === "card" && (
                    <div className="ml-auto text-blue-500">✓</div>
                  )}
                </div>
              </button>

              {/* Save for Later */}
              <button
                onClick={() => handlePaymentMethodSelect("saved")}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedPaymentMethod === "saved"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled
              >
                <div className="flex items-center space-x-3 opacity-50">
                  <div className="text-2xl">🧾</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Save for Later
                    </div>
                    <div className="text-sm text-gray-500">
                      Hold transaction (coming soon)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Cash Amount Input (shown when cash is selected) */}
          {selectedPaymentMethod === "cash" && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cash Amount
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Received
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min={cartTotal}
                      value={cashReceived || ""}
                      onChange={(e) =>
                        setCashReceived(parseFloat(e.target.value) || 0)
                      }
                      placeholder={cartTotal.toFixed(2)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-lg font-mono"
                    />
                  </div>
                </div>

                {/* Quick Cash Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    Math.ceil(cartTotal),
                    Math.ceil(cartTotal / 5) * 5,
                    Math.ceil(cartTotal / 10) * 10,
                    Math.ceil(cartTotal / 20) * 20,
                  ].map((amount, index) => (
                    <button
                      key={index}
                      onClick={() => setCashReceived(amount)}
                      className="btn-secondary text-sm"
                    >
                      {formatPrice(amount)}
                    </button>
                  ))}
                </div>

                {/* Change Calculation */}
                {cashReceived > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Change:</span>
                      <span
                        className={`text-lg font-semibold ${
                          change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatPrice(Math.abs(change))}
                        {change < 0 && " (Insufficient)"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proceed to Payment Button */}
          <div className="card p-6">
            <button
              onClick={handleProceedToPayment}
              disabled={
                !canProceed || (selectedPaymentMethod === "cash" && change < 0)
              }
              className="w-full btn-primary text-lg py-4"
            >
              {!selectedPaymentMethod
                ? "Select Payment Method"
                : selectedPaymentMethod === "cash" && change < 0
                ? "Insufficient Cash Amount"
                : `Complete Payment • ${formatPrice(cartTotal)}`}
            </button>

            {!hasItems && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Add items to cart to enable checkout
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={paymentModalOpen}
        onClose={handlePaymentComplete}
        status={paymentStatus}
        paymentMethod={
          selectedPaymentMethod === "saved"
            ? "other"
            : (selectedPaymentMethod as PaymentMethod) || "cash"
        }
        amount={cartTotal}
        cashReceived={
          selectedPaymentMethod === "cash" ? cashReceived : undefined
        }
        change={selectedPaymentMethod === "cash" ? change : undefined}
        onRetry={handleRetryPayment}
        onNewTransaction={() => {
          setPaymentModalOpen(false);
          setPaymentStatus("selecting");
        }}
      />
    </div>
  );
};

export default CheckoutSummary;
