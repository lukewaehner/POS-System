import { useState, useEffect, useCallback, useRef } from "react";

export interface BarcodeScannerOptions {
  onBarcodeScanned?: (barcode: string) => void;
  onError?: (error: string) => void;
  minBarcodeLength?: number;
  maxBarcodeLength?: number;
  scanTimeout?: number; // ms between keystrokes to consider as separate scan
  enableLogging?: boolean;
  preventDefaultKeyEvents?: boolean;
}

export interface BarcodeScannerState {
  isScanning: boolean;
  lastScannedBarcode: string | null;
  scanCount: number;
  isConnected: boolean;
  error: string | null;
  lastScanTime: number;
}

export const useBarcodeScanner = (options: BarcodeScannerOptions = {}) => {
  const {
    onBarcodeScanned,
    onError,
    minBarcodeLength = 8,
    maxBarcodeLength = 20,
    scanTimeout = 50, // Shorter timeout for better scanner detection
    enableLogging = false,
    preventDefaultKeyEvents = true,
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

  // Hook initialization logging removed - no longer needed

  const [state, setState] = useState<BarcodeScannerState>({
    isScanning: false,
    lastScannedBarcode: null,
    scanCount: 0,
    isConnected: false,
    error: null,
    lastScanTime: 0,
  });

  const barcodeBuffer = useRef<string>("");
  const lastKeystroke = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef<boolean>(false);
  const keyTimings = useRef<number[]>([]);

  const log = useCallback(
    (message: string, data?: any) => {
      if (enableLogging) {
        console.log(`[BarcodeScanner] ${message}`, data || "");
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
    barcodeBuffer.current = "";
    lastKeystroke.current = 0;
    isProcessing.current = false;
    keyTimings.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateState({ isScanning: false, error: null });
  }, [updateState]);

  const isLikelyBarcodeScanner = useCallback(() => {
    // Analyze the timing pattern to determine if this looks like a barcode scanner
    if (keyTimings.current.length < 3) return false;

    // Calculate average time between keystrokes
    const intervals = [];
    for (let i = 1; i < keyTimings.current.length; i++) {
      intervals.push(keyTimings.current[i] - keyTimings.current[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const maxInterval = Math.max(...intervals);

    // Barcode scanners typically have:
    // - Very consistent timing (low variation)
    // - Fast input (under 100ms between chars)
    // - No pauses longer than 200ms
    const isConsistent = maxInterval < 200;
    const isFast = avgInterval < 100;

    log(
      `Timing analysis: avg=${avgInterval.toFixed(
        1
      )}ms, max=${maxInterval}ms, fast=${isFast}, consistent=${isConsistent}`
    );

    return isConsistent && isFast;
  }, [log]);

  const processBarcodeInput = useCallback(
    (barcode: string) => {
      if (isProcessing.current) return;

      isProcessing.current = true;
      log("Processing barcode:", barcode);

      // Validate barcode length
      if (
        barcode.length < minBarcodeLength ||
        barcode.length > maxBarcodeLength
      ) {
        const error = `Invalid barcode length: ${barcode.length} (expected ${minBarcodeLength}-${maxBarcodeLength})`;
        log(error);
        onErrorRef.current?.(error);
        updateState({ error, isScanning: false });
        isProcessing.current = false;
        return;
      }

      // Prevent duplicate scans within 1 second
      setState((prev) => {
        if (prev.lastScannedBarcode === barcode) {
          const timeSinceLastScan = Date.now() - prev.lastScanTime;
          if (timeSinceLastScan < 1000) {
            // 1 second debounce
            log("Duplicate barcode scan ignored (debounced)");
            isProcessing.current = false;
            return prev;
          }
        }

        return {
          ...prev,
          lastScannedBarcode: barcode,
          scanCount: prev.scanCount + 1,
          isScanning: false,
          error: null,
          lastScanTime: Date.now(),
        };
      });

      // Notify callback
      try {
        onBarcodeScannerRef.current?.(barcode);
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
      // Detect if this looks like the start of a barcode scan
      const isFirstDigitOfPotentialScan =
        event.key.length === 1 &&
        /[0-9]/.test(event.key) &&
        barcodeBuffer.current.length === 0;

      // If we detect a potential barcode scan starting while an input is focused,
      // blur the input and allow the scan to proceed
      if (
        isFirstDigitOfPotentialScan &&
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement)
      ) {
        log(
          "Input field focused during scan start - blurring and allowing scan"
        );
        (event.target as HTMLElement).blur();
        // Continue processing instead of returning
      } else if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        // Still ignore if we're in the middle of a scan or it's not a digit
        return;
      }

      // Ignore modifier keys and special keys
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      const currentTime = Date.now();
      const timeSinceLastKey = currentTime - lastKeystroke.current;

      // Barcode scanners typically send characters very quickly (under 50ms between chars)
      // If more than 200ms has passed, this is likely manual typing, not a scanner
      if (timeSinceLastKey > 200 && barcodeBuffer.current.length > 0) {
        log("Manual typing detected, clearing buffer");
        barcodeBuffer.current = "";
        updateState({ isScanning: false });
        return;
      }

      lastKeystroke.current = currentTime;

      // Handle Enter key (end of barcode scan)
      if (event.key === "Enter") {
        const barcode = barcodeBuffer.current.trim();
        if (barcode && barcode.length >= minBarcodeLength) {
          // Check if this looks like a barcode scanner based on timing
          if (isLikelyBarcodeScanner()) {
            if (preventDefaultKeyEvents) {
              event.preventDefault();
            }
            log("Enter key detected, processing barcode:", barcode);
            processBarcodeInput(barcode);
          } else {
            log("Input doesn't look like barcode scanner, ignoring");
          }
        }
        barcodeBuffer.current = "";
        keyTimings.current = [];
        updateState({ isScanning: false });
        return;
      }

      // Handle regular characters (building barcode)
      if (event.key.length === 1) {
        const char = event.key;

        // Only accept digits and common barcode characters (more restrictive)
        if (/[0-9]/.test(char)) {
          // Record keystroke timing
          keyTimings.current.push(currentTime);

          // Only start capturing if this seems like rapid input (scanner-like)
          if (barcodeBuffer.current.length === 0) {
            // First character - start capturing
            updateState({ isScanning: true, error: null });
            log("Started scanning barcode");
          }

          if (preventDefaultKeyEvents) {
            event.preventDefault();
          }

          barcodeBuffer.current += char;

          // Set timeout to reset if no more input
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (barcodeBuffer.current) {
              log("Scan timeout, resetting buffer");
              barcodeBuffer.current = "";
              keyTimings.current = [];
              updateState({ isScanning: false });
            }
          }, scanTimeout * 5); // Shorter timeout for incomplete scans
        } else {
          // Non-digit character - this is likely manual typing
          if (barcodeBuffer.current.length > 0) {
            log("Non-digit character detected, clearing buffer");
            barcodeBuffer.current = "";
            keyTimings.current = [];
            updateState({ isScanning: false });
          }
        }
      }
    },
    [
      scanTimeout,
      preventDefaultKeyEvents,
      processBarcodeInput,
      updateState,
      log,
      minBarcodeLength,
      isLikelyBarcodeScanner,
    ]
  );

  // Setup event listeners - using a ref to store the handler to prevent re-renders
  const handleKeyDownRef = useRef(handleKeyDown);
  handleKeyDownRef.current = handleKeyDown;

  useEffect(() => {
    log("Setting up barcode scanner listeners");

    // Create a stable reference to the handler
    const stableHandler = (event: KeyboardEvent) => {
      handleKeyDownRef.current(event);
    };

    // Add keyboard event listener
    document.addEventListener("keydown", stableHandler);

    // Simulate scanner connection (in real implementation, you might check for USB devices)
    updateState({ isConnected: true });

    return () => {
      log("Cleaning up barcode scanner listeners");
      document.removeEventListener("keydown", stableHandler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [log, updateState]); // Minimal dependencies

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
    simulateBarcodeScan: processBarcodeInput,
  };
};

export default useBarcodeScanner;
