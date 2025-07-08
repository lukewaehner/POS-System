import React from "react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: "error" | "warning" | "network" | "notFound";
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  showIcon?: boolean;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = "error",
  onRetry,
  onDismiss,
  retryText = "Try Again",
  showIcon = true,
  className = "",
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case "warning":
        return {
          icon: (
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          ),
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconBg: "bg-yellow-100",
          textColor: "text-yellow-800",
          titleColor: "text-yellow-900",
        };
      case "network":
        return {
          icon: (
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
                d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
              />
            </svg>
          ),
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          textColor: "text-red-700",
          titleColor: "text-red-900",
        };
      case "notFound":
        return {
          icon: (
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          ),
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconBg: "bg-gray-100",
          textColor: "text-gray-700",
          titleColor: "text-gray-900",
        };
      case "error":
      default:
        return {
          icon: (
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          ),
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          textColor: "text-red-700",
          titleColor: "text-red-900",
        };
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "warning":
        return "Warning";
      case "network":
        return "Connection Error";
      case "notFound":
        return "Not Found";
      case "error":
      default:
        return "Error";
    }
  };

  const { icon, bgColor, borderColor, iconBg, textColor, titleColor } =
    getIconAndColors();

  return (
    <div
      className={`rounded-lg border p-4 ${bgColor} ${borderColor} ${className}`}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}
            >
              {icon}
            </div>
          </div>
        )}
        <div className={`${showIcon ? "ml-3" : ""} flex-1`}>
          <h3 className={`text-sm font-medium ${titleColor}`}>
            {title || getDefaultTitle()}
          </h3>
          <div className={`mt-1 text-sm ${textColor}`}>
            <p>{message}</p>
          </div>
          {(onRetry || onDismiss) && (
            <div className="mt-4">
              <div className="flex space-x-3">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    🔄 {retryText}
                  </button>
                )}
                {onDismiss && (
                  <button
                    type="button"
                    onClick={onDismiss}
                    className={`px-3 py-2 text-sm font-medium shadow-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      type === "warning"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                        : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                    }`}
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized error components for common scenarios
export const NetworkErrorMessage: React.FC<{
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ onRetry, onDismiss }) => (
  <ErrorMessage
    type="network"
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    onDismiss={onDismiss}
    retryText="Retry Connection"
  />
);

export const NotFoundErrorMessage: React.FC<{
  resource?: string;
  onRetry?: () => void;
}> = ({ resource = "item", onRetry }) => (
  <ErrorMessage
    type="notFound"
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
    message={`The requested ${resource} could not be found. It may have been deleted or moved.`}
    onRetry={onRetry}
    retryText="Refresh"
  />
);

export const LoadingErrorMessage: React.FC<{
  resource?: string;
  onRetry?: () => void;
}> = ({ resource = "data", onRetry }) => (
  <ErrorMessage
    type="error"
    title="Loading Error"
    message={`Failed to load ${resource}. Please try again.`}
    onRetry={onRetry}
    retryText="Reload"
  />
);

export const EmptyStateMessage: React.FC<{
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}> = ({ title = "No Data", message, actionText, onAction, icon = "📭" }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    {actionText && onAction && (
      <button onClick={onAction} className="btn-primary">
        {actionText}
      </button>
    )}
  </div>
);

export default ErrorMessage;
