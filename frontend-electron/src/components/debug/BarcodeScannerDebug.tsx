import React, { useState, useEffect, useCallback, useRef } from "react";
import useBarcodeScanner from "../../hooks/useBarcodeScanner";

interface KeystrokeEvent {
  timestamp: number;
  key: string;
  keyCode: number;
  timeSinceLastKey: number;
  bufferAfter: string;
  eventType: "captured" | "ignored" | "processed";
  reason?: string;
}

const BarcodeScannerDebug: React.FC = () => {
  const [events, setEvents] = useState<KeystrokeEvent[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("");
  const [scanResults, setScanResults] = useState<
    Array<{ barcode: string; timestamp: number }>
  >([]);
  const [testBarcode, setTestBarcode] = useState("123456789012");
  const eventIdRef = useRef(0);
  const lastEventTimeRef = useRef(0);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    console.log("🎯 BARCODE SCANNED:", barcode);
    setLastScannedBarcode(barcode);
    setScanResults((prev) => [...prev, { barcode, timestamp: Date.now() }]);
  }, []);

  const handleBarcodeError = useCallback((error: string) => {
    console.error("🚨 BARCODE ERROR:", error);
  }, []);

  const barcodeScanner = useBarcodeScanner({
    onBarcodeScanned: handleBarcodeScanned,
    onError: handleBarcodeError,
    minBarcodeLength: 8,
    maxBarcodeLength: 20,
    timeThreshold: 100,
    enableLogging: true,
    preventDefaultKeyEvents: false, // Don't prevent events so we can see them
  });

  // Raw keyboard event listener for debugging
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeSinceLastKey = currentTime - lastEventTimeRef.current;
      lastEventTimeRef.current = currentTime;

      // Determine if this event would be processed by the scanner
      let eventType: "captured" | "ignored" | "processed" = "captured";
      let reason = "";

      // Check if it would be ignored
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        eventType = "ignored";
        reason = "Input field focused";
      } else if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        eventType = "ignored";
        reason = "Modifier key pressed";
      } else if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
        eventType = "ignored";
        reason = "Non-digit character";
      } else if (event.key === "Enter") {
        eventType = "processed";
        reason = "Enter key - potential barcode end";
      }

      const newEvent: KeystrokeEvent = {
        timestamp: currentTime,
        key: event.key,
        keyCode: event.keyCode,
        timeSinceLastKey,
        bufferAfter: "", // We'll update this
        eventType,
        reason,
      };

      setEvents((prev) => {
        const updated = [...prev, newEvent].slice(-50); // Keep last 50 events
        return updated;
      });

      eventIdRef.current++;
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isEnabled]);

  const clearEvents = () => {
    setEvents([]);
    setScanResults([]);
    setLastScannedBarcode("");
  };

  const simulateScanner = () => {
    const barcode = testBarcode;
    console.log("🤖 Simulating barcode scan:", barcode);

    // Simulate rapid keystrokes like a real scanner
    const chars = barcode.split("");
    let delay = 0;

    chars.forEach((char, index) => {
      setTimeout(() => {
        const event = new KeyboardEvent("keydown", {
          key: char,
          keyCode: char.charCodeAt(0),
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(event);
      }, delay);
      delay += 30; // 30ms between characters (typical for scanner)
    });

    // Send Enter key after all characters
    setTimeout(() => {
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(enterEvent);
    }, delay + 10);
  };

  const simulateManualTyping = () => {
    const barcode = testBarcode;
    console.log("👤 Simulating manual typing:", barcode);

    // Simulate slower typing like a human
    const chars = barcode.split("");
    let delay = 0;

    chars.forEach((char, index) => {
      setTimeout(() => {
        const event = new KeyboardEvent("keydown", {
          key: char,
          keyCode: char.charCodeAt(0),
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(event);
      }, delay);
      delay += 150 + Math.random() * 100; // 150-250ms between characters (human typing)
    });

    // Send Enter key after all characters
    setTimeout(() => {
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(enterEvent);
    }, delay + 200);
  };

  const getEventColor = (eventType: KeystrokeEvent["eventType"]) => {
    switch (eventType) {
      case "captured":
        return "bg-blue-100 text-blue-800";
      case "ignored":
        return "bg-gray-100 text-gray-600";
      case "processed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔍 Barcode Scanner Debug Console
        </h2>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>Enable Debug Logging</span>
              </label>
              <button
                onClick={clearEvents}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Clear Events
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={testBarcode}
                onChange={(e) => setTestBarcode(e.target.value)}
                placeholder="Test barcode"
                className="px-3 py-2 border rounded flex-1"
              />
              <button
                onClick={simulateScanner}
                className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Simulate Scanner
              </button>
              <button
                onClick={simulateManualTyping}
                className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                Simulate Typing
              </button>
            </div>
          </div>

          {/* Scanner Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Scanner Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    barcodeScanner.isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span>
                  {barcodeScanner.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    barcodeScanner.isScanning
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span>
                  {barcodeScanner.isScanning ? "Scanning..." : "Idle"}
                </span>
              </div>
              <div>Scan Count: {barcodeScanner.scanCount}</div>
              <div>
                Last Barcode: {barcodeScanner.lastScannedBarcode || "None"}
              </div>
              {barcodeScanner.error && (
                <div className="text-red-600">
                  Error: {barcodeScanner.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scan Results */}
        {scanResults.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">
              ✅ Successful Scans
            </h3>
            <div className="space-y-1">
              {scanResults.slice(-10).map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {new Date(result.timestamp).toLocaleTimeString()}:{" "}
                  {result.barcode}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Events */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            🎹 Live Keyboard Events
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {events.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No events captured yet. Try typing or scanning...
              </div>
            ) : (
              events.slice(-20).map((event, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs font-mono ${getEventColor(
                    event.eventType
                  )}`}
                >
                  <div className="grid grid-cols-6 gap-2">
                    <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    <div>
                      <strong>{event.key === " " ? "SPACE" : event.key}</strong>
                      {event.key === "Enter" && " 🔄"}
                    </div>
                    <div>#{event.keyCode}</div>
                    <div>+{event.timeSinceLastKey}ms</div>
                    <div className="capitalize">{event.eventType}</div>
                    <div className="text-xs">{event.reason}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            🛠️ Debug Instructions
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              • <strong>Blue events</strong>: Captured and processed by scanner
            </p>
            <p>
              • <strong>Gray events</strong>: Ignored (input focused, modifier
              keys, etc.)
            </p>
            <p>
              • <strong>Green events</strong>: Processed as potential barcode
              end
            </p>
            <p>
              • <strong>Time delta</strong>: Shows timing between keystrokes
            </p>
            <p>
              • <strong>Scanner simulation</strong>: Sends keys rapidly (30ms
              apart)
            </p>
            <p>
              • <strong>Manual typing</strong>: Sends keys slowly (150-250ms
              apart)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerDebug;
