import React, { forwardRef, InputHTMLAttributes } from "react";

interface DesignatedScanInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  onBarcodeScanned?: (barcode: string) => void;
  placeholder?: string;
  className?: string;
}

export const DesignatedScanInput = forwardRef<
  HTMLInputElement,
  DesignatedScanInputProps
>(
  (
    {
      onBarcodeScanned,
      placeholder = "Scan barcode here...",
      className = "",
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && onBarcodeScanned) {
        const input = event.currentTarget;
        const barcode = input.value.trim();
        if (barcode) {
          onBarcodeScanned(barcode);
          input.value = ""; // Clear after scanning
        }
      }

      // Call original onKeyDown if provided
      if (props.onKeyDown) {
        props.onKeyDown(event);
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        className={`barcode-input ${className}`}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

DesignatedScanInput.displayName = "DesignatedScanInput";

export default DesignatedScanInput;
