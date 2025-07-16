import { useCallback, useEffect, useRef, useState } from "react";

export interface BarcodeScannerOptions {
  onBarcodeScanned?: (barcode: string) => void;
  onError?: (error: string) => void;
  minBarcodeLength?: number;
  maxBarcodeLength?: number;
  timeThreshold?: number; // ms between keystrokes to consider as continuous scan
  enableLogging?: boolean;
  preventDefaultKeyEvents?: boolean;
  designatedScanClass?: string; // CSS class for designated scan fields
}

export interface BarcodeScannerState {
  isScanning: boolean;
  lastScannedBarcode: string | null;
  scanCount: number;
  isConnected: boolean;
  error: string | null;
  lastScanTime: number;
}

// Check if we should prevent text entry into form fields
const shouldPreventTextEntry = (
  event: KeyboardEvent,
  designatedScanClass?: string
): boolean => {
  const activeElement = document.activeElement;

  if (!activeElement) return false;

  // Allow text entry if in designated scan field
  if (
    designatedScanClass &&
    activeElement.classList.contains(designatedScanClass)
  ) {
    return false;
  }

  // Allow text entry in search inputs (don't prevent barcode scanner from working, but allow typing)
  if (activeElement instanceof HTMLInputElement) {
    const inputType = activeElement.type?.toLowerCase();
    const placeholder = activeElement.placeholder?.toLowerCase();
    const className = activeElement.className?.toLowerCase();

    // Allow typing in search inputs
    if (
      inputType === "search" ||
      placeholder?.includes("search") ||
      className?.includes("search") ||
      activeElement.getAttribute("role") === "searchbox"
    ) {
      return false;
    }
  }

  // Prevent text entry in regular form fields
  const isInputField = ["INPUT", "TEXTAREA", "SELECT"].includes(
    activeElement.tagName
  );
  const isContentEditable =
    activeElement.hasAttribute("contenteditable") &&
    activeElement.getAttribute("contenteditable") !== "false";
  const isTextboxRole = activeElement.getAttribute("role") === "textbox";

  return isInputField || isContentEditable || isTextboxRole;
};

// Enhanced barcode validation
const isValidBarcode = (
  barcode: string,
  minLength: number,
  maxLength: number
): boolean => {
  // Basic length validation
  if (barcode.length < minLength || barcode.length > maxLength) {
    return false;
  }

  // Check for valid characters (digits and common barcode characters)
  const validPattern = /^[0-9A-Z\-\.\ ]+$/i;
  if (!validPattern.test(barcode)) {
    return false;
  }

  // For now, skip strict checksum validation to be more lenient
  // This can be made configurable if needed
  // if (barcode.length === 13 || barcode.length === 12) {
  //   return validateEANChecksum(barcode);
  // }

  return true;
};

// EAN/UPC checksum validation (currently not used but kept for future)
const validateEANChecksum = (barcode: string): boolean => {
  const digits = barcode.replace(/[^0-9]/g, "");
  if (digits.length !== 12 && digits.length !== 13) return true; // Skip if not EAN/UPC

  let sum = 0;
  const checkDigit = parseInt(digits.slice(-1));
  const codeDigits = digits.slice(0, -1);

  // UPC-A/EAN-13 checksum calculation
  for (let i = 0; i < codeDigits.length; i++) {
    const digit = parseInt(codeDigits[i]);
    // For UPC-A (12 digits): odd positions * 3, even positions * 1
    // For EAN-13 (13 digits): odd positions * 1, even positions * 3
    const multiplier =
      digits.length === 12 ? (i % 2 === 0 ? 3 : 1) : i % 2 === 0 ? 1 : 3;
    sum += digit * multiplier;
  }

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
};

// Intelligent scan pattern detection
const detectScanPattern = (
  keyTimings: number[],
  timeThreshold: number
): boolean => {
  if (keyTimings.length < 3) return false;

  let rapidKeystrokes = 0;
  let averageInterval = 0;

  for (let i = 1; i < keyTimings.length; i++) {
    const interval = keyTimings[i] - keyTimings[i - 1];
    averageInterval += interval;

    if (interval < timeThreshold) {
      rapidKeystrokes++;
    }
  }

  averageInterval /= keyTimings.length - 1;

  // Consider it a scan if most intervals are rapid and average is below threshold
  const rapidRatio = rapidKeystrokes / (keyTimings.length - 1);
  return rapidRatio > 0.7 && averageInterval < timeThreshold;
};

export const useBarcodeScanner = (options: BarcodeScannerOptions = {}) => {
  const {
    onBarcodeScanned,
    onError,
    minBarcodeLength = 8,
    maxBarcodeLength = 20,
    timeThreshold = 100, // 100ms between keystrokes
    enableLogging = false,
    preventDefaultKeyEvents = true,
    designatedScanClass = "barcode-input",
  } = options;

  // Use refs to store callback functions to prevent re-renders
  const onBarcodeScannerRef = useRef(onBarcodeScanned);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onBarcodeScannerRef.current = onBarcodeScanned;
  }, [onBarcodeScanned]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const [state, setState] = useState<BarcodeScannerState>({
    isScanning: false,
    lastScannedBarcode: null,
    scanCount: 0,
    isConnected: false,
    error: null,
    lastScanTime: 0,
  });

  const scanBuffer = useRef<string>("");
  const lastKeystroke = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef<boolean>(false);
  const keyTimings = useRef<number[]>([]);

  const log = useCallback(
    (message: string, data?: any) => {
      if (enableLogging) {
        console.log(`[SmartBarcodeScanner] ${message}`, data || "");
      }
    },
    [enableLogging]
  );

  const updateState = useCallback((updates: Partial<BarcodeScannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const resetScanner = useCallback(() => {
    scanBuffer.current = "";
    lastKeystroke.current = 0;
    isProcessing.current = false;
    keyTimings.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateState({ isScanning: false, error: null });
  }, [updateState]);

  const processBarcode = useCallback(
    (barcode: string) => {
      if (isProcessing.current) return;

      isProcessing.current = true;
      const trimmedBarcode = barcode.trim();

      log("Processing barcode:", trimmedBarcode);

      // Enhanced barcode validation
      if (!isValidBarcode(trimmedBarcode, minBarcodeLength, maxBarcodeLength)) {
        const error = `Invalid barcode: ${trimmedBarcode} (length: ${trimmedBarcode.length}, expected: ${minBarcodeLength}-${maxBarcodeLength})`;
        log(error);
        log("Barcode validation details:", {
          barcode: trimmedBarcode,
          length: trimmedBarcode.length,
          minLength: minBarcodeLength,
          maxLength: maxBarcodeLength,
          validChars: /^[0-9A-Z\-\.\ ]+$/i.test(trimmedBarcode),
        });
        onErrorRef.current?.(error);
        updateState({ error, isScanning: false });
        isProcessing.current = false;
        return;
      }

      // Prevent duplicate scans within 1 second
      setState((prev) => {
        if (prev.lastScannedBarcode === trimmedBarcode) {
          const timeSinceLastScan = Date.now() - prev.lastScanTime;
          if (timeSinceLastScan < 1000) {
            log("Duplicate barcode scan ignored (debounced)");
            isProcessing.current = false;
            return prev;
          }
        }

        return {
          ...prev,
          lastScannedBarcode: trimmedBarcode,
          scanCount: prev.scanCount + 1,
          isScanning: false,
          error: null,
          lastScanTime: Date.now(),
        };
      });

      // Notify callback
      try {
        onBarcodeScannerRef.current?.(trimmedBarcode);
        log("Barcode scan successful");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error processing barcode";
        log("Error in barcode callback:", errorMessage);
        onErrorRef.current?.(errorMessage);
        updateState({ error: errorMessage });
      }

      // Reset processing flag after a short delay
      setTimeout(() => {
        isProcessing.current = false;
      }, 200);
    },
    [minBarcodeLength, maxBarcodeLength, updateState, log]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeystroke.current;

      // Reset buffer if too much time passed (not continuous scanning)
      if (timeDiff > timeThreshold && scanBuffer.current.length > 0) {
        log("Time threshold exceeded, clearing buffer");
        scanBuffer.current = "";
        keyTimings.current = [];
        updateState({ isScanning: false });
      }

      // Ignore modifier keys and special keys
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      // Check if we should prevent text entry into form fields
      const shouldPreventEntry = shouldPreventTextEntry(
        event,
        designatedScanClass
      );

      lastKeystroke.current = currentTime;

      // Handle Enter key (end of barcode scan)
      if (event.key === "Enter") {
        if (scanBuffer.current.length >= minBarcodeLength) {
          // Check if this looks like a barcode scanner based on timing pattern
          if (detectScanPattern(keyTimings.current, timeThreshold)) {
            // Prevent default if in regular form field to avoid form submission
            if (shouldPreventEntry) {
              event.preventDefault();
            }
            log("Enter key detected, processing barcode:", scanBuffer.current);
            processBarcode(scanBuffer.current);
          } else {
            log("Input doesn't match scan pattern, ignoring");
          }
        }
        scanBuffer.current = "";
        keyTimings.current = [];
        updateState({ isScanning: false });
        return;
      }

      // Handle regular characters (building barcode)
      if (event.key.length === 1) {
        const char = event.key;

        // Accept alphanumeric characters and common barcode symbols
        if (/[0-9A-Z\-\.\ ]/i.test(char)) {
          // Record keystroke timing
          keyTimings.current.push(currentTime);

          // Start scanning indication
          if (scanBuffer.current.length === 0) {
            updateState({ isScanning: true, error: null });
            log("Started scanning barcode");
          }

          // Prevent text entry into regular form fields but allow designated scan fields
          if (shouldPreventEntry) {
            event.preventDefault();
            log("Prevented barcode text entry into form field");
          }

          scanBuffer.current += char;

          // Set timeout to reset if no more input
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (scanBuffer.current) {
              log("Scan timeout, resetting buffer");
              scanBuffer.current = "";
              keyTimings.current = [];
              updateState({ isScanning: false });
            }
          }, timeThreshold * 2);
        } else {
          // Invalid character - likely manual typing
          if (scanBuffer.current.length > 0) {
            log("Invalid character detected, clearing buffer");
            scanBuffer.current = "";
            keyTimings.current = [];
            updateState({ isScanning: false });
          }
        }
      }
    },
    [
      timeThreshold,
      designatedScanClass,
      processBarcode,
      updateState,
      log,
      minBarcodeLength,
    ]
  );

  // Setup event listeners
  const handleKeyDownRef = useRef(handleKeyDown);
  handleKeyDownRef.current = handleKeyDown;

  useEffect(() => {
    log("Setting up smart barcode scanner listeners");

    // Create a stable reference to the handler
    const stableHandler = (event: KeyboardEvent) => {
      handleKeyDownRef.current(event);
    };

    // Add keyboard event listener
    document.addEventListener("keydown", stableHandler);

    // Simulate scanner connection
    updateState({ isConnected: true });

    return () => {
      log("Cleaning up smart barcode scanner listeners");
      document.removeEventListener("keydown", stableHandler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [log, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetScanner();
    };
  }, [resetScanner]);

  return {
    ...state,
    resetScanner,
    clearError,
    // Manual barcode input for testing
    simulateBarcodeScan: processBarcode,
  };
};

export default useBarcodeScanner;
