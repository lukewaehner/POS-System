import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  color?: "blue" | "white" | "gray";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
  color = "blue",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "md":
        return "h-6 w-6";
      case "lg":
        return "h-8 w-8";
      case "xl":
        return "h-12 w-12";
      default:
        return "h-6 w-6";
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "white":
        return "text-white";
      case "gray":
        return "text-gray-600";
      case "blue":
      default:
        return "text-blue-600";
    }
  };

  const getTextSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-base";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <svg
          className={`animate-spin ${getSizeClasses()} ${getColorClasses()}`}
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
        {text && (
          <p
            className={`${getTextSizeClass()} ${getColorClasses()} font-medium`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
