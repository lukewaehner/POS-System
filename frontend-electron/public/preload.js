const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Platform information
  platform: process.platform,

  // App version (will be available when app is packaged)
  version: process.env.npm_package_version || "1.0.0",

  // Window management
  window: {
    minimize: () => ipcRenderer.invoke("window-minimize"),
    close: () => ipcRenderer.invoke("window-close"),
    toggleFullscreen: () => ipcRenderer.invoke("window-toggle-fullscreen"),
  },

  // Future: Printer communication
  printer: {
    // print: (data) => ipcRenderer.invoke('print-receipt', data),
    // getAvailablePrinters: () => ipcRenderer.invoke('get-printers'),
    // testPrint: () => ipcRenderer.invoke('test-print'),
  },

  // Future: Barcode scanner events
  scanner: {
    // onBarcodeScan: (callback) => {
    //   ipcRenderer.removeAllListeners('barcode-scan');
    //   ipcRenderer.on('barcode-scan', (event, barcode) => callback(barcode));
    // },
    // removeBarcodeScanListener: () => ipcRenderer.removeAllListeners('barcode-scan'),
  },

  // Future: Cash drawer control
  cashDrawer: {
    // open: () => ipcRenderer.invoke('open-cash-drawer'),
    // getStatus: () => ipcRenderer.invoke('cash-drawer-status'),
  },

  // Future: App settings and configuration
  settings: {
    // get: () => ipcRenderer.invoke('get-settings'),
    // save: (settings) => ipcRenderer.invoke('save-settings', settings),
    // reset: () => ipcRenderer.invoke('reset-settings'),
  },

  // Security: Secure storage for sensitive data
  store: {
    // get: (key) => ipcRenderer.invoke('secure-store-get', key),
    // set: (key, value) => ipcRenderer.invoke('secure-store-set', key, value),
    // delete: (key) => ipcRenderer.invoke('secure-store-delete', key),
  },

  // System information for diagnostics
  system: {
    getMemoryUsage: () => process.getSystemMemoryInfo?.() || null,
    getCPUUsage: () => process.getCPUUsage?.() || null,
  },

  // Keyboard shortcuts and events
  keyboard: {
    // onGlobalShortcut: (shortcut, callback) => {
    //   ipcRenderer.removeAllListeners(`shortcut-${shortcut}`);
    //   ipcRenderer.on(`shortcut-${shortcut}`, callback);
    // },
  },
});

// Additional security measures
Object.freeze(window.electronAPI);

// Security: Remove any exposed Node.js APIs
delete window.require;
delete window.exports;
delete window.module;
delete window.global;
delete window.Buffer;
delete window.process;
delete window.__dirname;
delete window.__filename;

// Prevent access to Electron internals
window.addEventListener("DOMContentLoaded", () => {
  // Remove any development tools access
  if (window.chrome && window.chrome.runtime) {
    delete window.chrome.runtime;
  }

  // Disable right-click context menu in production
  if (window.electronAPI.version !== "dev") {
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Disable F12 and other dev shortcuts in production
  document.addEventListener("keydown", (e) => {
    if (window.electronAPI.version !== "dev") {
      // Disable F12 (DevTools)
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }
    }
  });
});

// Console security: Override console in production
if (window.electronAPI.version !== "dev") {
  const originalConsole = window.console;
  window.console = {
    log: () => {},
    warn: () => {},
    error: originalConsole.error.bind(originalConsole), // Keep errors for debugging
    info: () => {},
    debug: () => {},
  };
}
