import React, { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { useNotifications } from "../hooks/useNotifications";

type PaymentMethod = "cash" | "card" | "other";
type PaymentStatus = "selecting" | "processing" | "success" | "failed";

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface CheckoutSummaryProps {
  onNavigate?: (page: string) => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ onNavigate }) => {
  const {
    cartItems,
    cartSubtotal,
    cartTax,
    cartTotal,
    clearCart,
    removeFromCart,
    updateCartQuantity,
  } = useCart();
  const { showSuccess, showError } = useNotifications();

  // State management
  const [activePaymentMethod, setActivePaymentMethod] =
    useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({});
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("selecting");
  const [receiptOption, setReceiptOption] = useState<
    "print" | "email" | "none"
  >("print");

  // Calculations
  const change = cashReceived - cartTotal;
  const hasItems = cartItems.length > 0;
  const canProceedCash =
    activePaymentMethod === "cash" && cashReceived >= cartTotal;
  const canProceedCard = activePaymentMethod === "card";
  const canProceed = hasItems && (canProceedCash || canProceedCard);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Generate smart quick amounts for cash
  const generateQuickAmounts = () => {
    const amounts = [];
    amounts.push(cartTotal); // Exact amount

    const roundedUp = Math.ceil(cartTotal);
    if (roundedUp !== cartTotal) amounts.push(roundedUp);

    const roundedTo5 = Math.ceil(cartTotal / 5) * 5;
    if (roundedTo5 !== roundedUp && amounts.length < 4)
      amounts.push(roundedTo5);

    const roundedTo10 = Math.ceil(cartTotal / 10) * 10;
    if (roundedTo10 !== roundedTo5 && amounts.length < 4)
      amounts.push(roundedTo10);

    return amounts.slice(0, 4);
  };

  // Handle cash input
  const handleCashInput = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setCashReceived(numericValue);
  };

  // Handle numpad input
  const handleNumpadInput = (digit: string) => {
    if (digit === "clear") {
      setCashReceived(0);
    } else if (digit === ".") {
      const currentStr = cashReceived.toString();
      if (!currentStr.includes(".")) {
        setCashReceived(parseFloat(currentStr + "."));
      }
    } else {
      const currentStr = cashReceived.toString();
      const newValue = currentStr === "0" ? digit : currentStr + digit;
      setCashReceived(parseFloat(newValue));
    }
  };

  // Handle payment processing
  const handleCompletePayment = () => {
    if (!canProceed) return;

    setPaymentStatus("processing");

    // Simulate payment processing
    setTimeout(() => {
      const success =
        activePaymentMethod === "cash" ? true : Math.random() > 0.1; // 90% success for cards

      if (success) {
        setPaymentStatus("success");
        showSuccess("Payment completed successfully!");

        // Clear cart after successful payment
        setTimeout(() => {
          clearCart();
          setCashReceived(0);
          setCustomerInfo({});
          setPaymentStatus("selecting");
        }, 2000);
      } else {
        setPaymentStatus("failed");
        showError("Payment failed. Please try again.");
        setTimeout(() => setPaymentStatus("selecting"), 2000);
      }
    }, 2000);
  };

  // Add back navigation function
  const handleBackToCart = () => {
    if (onNavigate) {
      onNavigate("checkout");
    }
  };

  // Render numpad for cash payments
  const renderNumpad = () => {
    const buttons = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["clear", "0", "."],
    ];

    return (
      <div className="grid grid-cols-3 gap-2">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => handleNumpadInput(btn)}
            className={`h-12 rounded-lg font-semibold transition-colors ${
              btn === "clear"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            {btn === "clear" ? "CLR" : btn}
          </button>
        ))}
      </div>
    );
  };

  if (!hasItems) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Cart is Empty
          </h2>
          <p className="text-gray-500">
            Add items to your cart to begin checkout
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Left Column - Order Details */}
      <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToCart}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
            </div>
            <button
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Customer
            </button>
          </div>
        </div>

        {/* Customer Info (Collapsible) */}
        {showCustomerInfo && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={customerInfo.name || ""}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={customerInfo.email || ""}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={customerInfo.phone || ""}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {item.product.name}
                    </span>
                    <span className="font-mono text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-mono">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-mono">{formatCurrency(cartTax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span className="font-mono text-green-600">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Payment */}
      <div className="w-96 bg-white flex flex-col">
        {/* Payment Method Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: "cash", label: "Cash", icon: "💵" },
              { id: "card", label: "Card", icon: "💳" },
              { id: "other", label: "Other", icon: "💰" },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() =>
                  setActivePaymentMethod(method.id as PaymentMethod)
                }
                className={`flex-1 py-4 px-3 text-center font-medium transition-colors ${
                  activePaymentMethod === method.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="text-2xl mb-1">{method.icon}</div>
                <div className="text-sm">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Content */}
        <div className="flex-1 p-6">
          {/* Total Due */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600">Total Due</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(cartTotal)}
            </div>
          </div>

          {/* Cash Payment */}
          {activePaymentMethod === "cash" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived || ""}
                  onChange={(e) => handleCashInput(e.target.value)}
                  className="w-full px-4 py-3 text-2xl font-mono text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-2 gap-2">
                {generateQuickAmounts().map((amount, index) => (
                  <button
                    key={index}
                    onClick={() => setCashReceived(amount)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      cashReceived === amount
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {/* Numpad */}
              <div className="mt-4">{renderNumpad()}</div>

              {/* Change Display */}
              {cashReceived > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Change:</span>
                    <span
                      className={`text-xl font-bold ${
                        change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {change >= 0
                        ? formatCurrency(change)
                        : `${formatCurrency(Math.abs(change))} short`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Payment */}
          {activePaymentMethod === "card" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💳</div>
                  <div>
                    <div className="font-medium text-blue-900">
                      Ready for Card Payment
                    </div>
                    <div className="text-sm text-blue-700">
                      Insert, swipe, or tap your card
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex space-x-2">
                {["💳", "💰", "📱", "📟"].map((icon, index) => (
                  <div
                    key={index}
                    className="flex-1 p-3 bg-gray-50 rounded-lg text-center"
                  >
                    <div className="text-xl">{icon}</div>
                  </div>
                ))}
              </div>

              {/* Card Reader Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Card Reader</span>
                </div>
                <span className="text-sm text-green-600">Ready</span>
              </div>

              {/* Development Mode Badge */}
              <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                Development Mode
              </div>
            </div>
          )}

          {/* Other Payment */}
          {activePaymentMethod === "other" && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚧</div>
              <div className="text-gray-600">Coming Soon</div>
            </div>
          )}
        </div>

        {/* Receipt Options */}
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: "print", icon: "🖨️", label: "Print" },
              { id: "email", icon: "📧", label: "Email" },
              { id: "none", icon: "🚫", label: "None" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setReceiptOption(option.id as any)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  receiptOption === option.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="text-lg">{option.icon}</div>
                <div className="text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Complete Payment Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleCompletePayment}
            disabled={!canProceed || paymentStatus === "processing"}
            className={`w-full py-4 text-lg font-semibold rounded-lg transition-colors ${
              canProceed && paymentStatus === "selecting"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {paymentStatus === "processing" ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : !canProceed ? (
              activePaymentMethod === "cash" && cashReceived < cartTotal ? (
                "Insufficient Amount"
              ) : (
                "Complete Payment"
              )
            ) : (
              `Complete Payment • ${formatCurrency(cartTotal)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
