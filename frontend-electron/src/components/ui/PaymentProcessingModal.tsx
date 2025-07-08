import React from "react";
import Modal from "./Modal";

export type PaymentStatus =
  | "selecting"
  | "processing"
  | "success"
  | "failed"
  | "cancelled";

export type PaymentMethod = "cash" | "card" | "other";

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amount?: number;
  cashReceived?: number;
  change?: number;
  errorMessage?: string;
  onRetry?: () => void;
  onNewTransaction?: () => void;
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  onClose,
  status,
  paymentMethod,
  amount = 0,
  cashReceived = 0,
  change = 0,
  errorMessage,
  onRetry,
  onNewTransaction,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case "cash":
        return "💵";
      case "card":
        return "💳";
      default:
        return "💰";
    }
  };

  const getPaymentMethodText = () => {
    switch (paymentMethod) {
      case "cash":
        return "Cash Payment";
      case "card":
        return "Card Payment";
      default:
        return "Payment";
    }
  };

  const renderContent = () => {
    switch (status) {
      case "selecting":
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select Payment Method
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose how the customer wants to pay
            </p>
            <div className="text-xl font-semibold text-gray-900">
              Total: {formatPrice(amount)}
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
              <svg
                className="animate-spin h-6 w-6 text-yellow-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Processing Payment...
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {getPaymentMethodIcon()} {getPaymentMethodText()} in progress
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">{formatPrice(amount)}</span>
              </div>
              {paymentMethod === "cash" && cashReceived > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cash Received:</span>
                    <span className="font-medium">
                      {formatPrice(cashReceived)}
                    </span>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Change Due:</span>
                      <span>{formatPrice(change)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Successful! 🎉
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Transaction completed successfully
            </p>
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-medium">
                  {getPaymentMethodIcon()} {getPaymentMethodText()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-medium">{formatPrice(amount)}</span>
              </div>
              {paymentMethod === "cash" && change > 0 && (
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Change Given:</span>
                  <span>{formatPrice(change)}</span>
                </div>
              )}
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {errorMessage || "There was an error processing the payment"}
            </p>
            <div className="text-sm text-gray-500">
              Amount: {formatPrice(amount)}
            </div>
          </div>
        );

      case "cancelled":
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payment Cancelled
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The payment was cancelled by the user
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch (status) {
      case "selecting":
        return (
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
          </div>
        );

      case "processing":
        return (
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel Payment
            </button>
          </div>
        );

      case "success":
        return (
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Close
            </button>
            {onNewTransaction && (
              <button onClick={onNewTransaction} className="flex-1 btn-primary">
                🛒 New Transaction
              </button>
            )}
          </div>
        );

      case "failed":
        return (
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            {onRetry && (
              <button onClick={onRetry} className="flex-1 btn-primary">
                🔄 Try Again
              </button>
            )}
          </div>
        );

      case "cancelled":
        return (
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-primary">
              OK
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={status === "processing" ? () => {} : onClose}
      size="sm"
      showCloseButton={status !== "processing"}
      closeOnOverlayClick={status !== "processing"}
      closeOnEscape={status !== "processing"}
    >
      {renderContent()}

      {renderButtons() && <div className="mt-6">{renderButtons()}</div>}
    </Modal>
  );
};

export default PaymentProcessingModal;
