// TypeScript declarations for Electron API
interface ElectronAPI {
  platform: string;
  version: string;

  window: {
    minimize: () => Promise<void>;
    close: () => Promise<void>;
    toggleFullscreen: () => Promise<void>;
  };

  printer: {
    // print: (data: any) => Promise<boolean>;
    // getAvailablePrinters: () => Promise<string[]>;
    // testPrint: () => Promise<boolean>;
  };

  scanner: {
    // onBarcodeScan: (callback: (barcode: string) => void) => void;
    // removeBarcodeScanListener: () => void;
  };

  cashDrawer: {
    // open: () => Promise<boolean>;
    // getStatus: () => Promise<'open' | 'closed' | 'unknown'>;
  };

  settings: {
    // get: () => Promise<any>;
    // save: (settings: any) => Promise<boolean>;
    // reset: () => Promise<boolean>;
  };

  store: {
    // get: (key: string) => Promise<any>;
    // set: (key: string, value: any) => Promise<boolean>;
    // delete: (key: string) => Promise<boolean>;
  };

  system: {
    getMemoryUsage: () => any;
    getCPUUsage: () => any;
  };

  keyboard: {
    // onGlobalShortcut: (shortcut: string, callback: () => void) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
