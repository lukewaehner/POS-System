const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    center: true, // Center window on screen
    resizable: !isDev, // Allow resize in dev, lock in production
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration in renderer
      contextIsolation: true, // Security: enable context isolation
      enableRemoteModule: false, // Security: disable remote module
      webSecurity: true, // Security: enable web security
      allowRunningInsecureContent: false, // Security: block insecure content
      experimentalFeatures: false, // Security: disable experimental features
      preload: path.join(__dirname, "preload.js"), // Use preload script for secure communication
    },
    show: false, // Don't show until ready-to-show
    titleBarStyle: "default",
    autoHideMenuBar: true, // Hide menu bar for kiosk mode
    // Add icon for the app (you can add an icon file later)
    // icon: path.join(__dirname, 'icon.png'),
  });

  // For production POS mode, consider kiosk mode
  if (!isDev) {
    // Uncomment the next line for full kiosk mode (no window controls)
    // mainWindow.setKiosk(true);

    // Alternative: Maximized window for POS experience
    mainWindow.maximize();
  }

  // Load the app
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Focus the window
    mainWindow.focus();

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Security: Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  // Security: Prevent navigation to external URLs
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      parsedUrl.origin !== "http://localhost:3000" &&
      parsedUrl.origin !== "file://"
    ) {
      event.preventDefault();
    }
  });

  // Security: Block downloads
  mainWindow.webContents.session.on("will-download", (event) => {
    event.preventDefault();
  });

  // Prevent zoom for consistent UI
  mainWindow.webContents.on("zoom-changed", (event) => {
    event.preventDefault();
  });

  // Disable zoom shortcuts
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control || input.meta) {
      if (input.key === "+" || input.key === "-" || input.key === "0") {
        event.preventDefault();
      }
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Additional security: Set CSP headers
  app.on("web-contents-created", (event, contents) => {
    contents.on("dom-ready", () => {
      contents.insertCSS(`
        /* Disable text selection for touch screen */
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }
        
        /* Allow text selection in input fields */
        input, textarea {
          -webkit-user-select: text;
          -moz-user-select: text;
          user-select: text;
        }
      `);
    });
  });

  createWindow();
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent creation of new windows
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });

  // Additional security: Disable eval and other dangerous functions
  contents.on("dom-ready", () => {
    contents.executeJavaScript(`
      // Disable eval for security
      window.eval = function() {
        throw new Error('eval() is disabled for security');
      };
      
      // Disable function constructor
      window.Function = function() {
        throw new Error('Function constructor is disabled for security');
      };
    `);
  });
});

// Disable menu bar for kiosk mode
if (!isDev) {
  Menu.setApplicationMenu(null);
}

// Security: Disable hardware acceleration if needed (uncomment if having issues)
// app.disableHardwareAcceleration();

// Handle app certificate errors (for self-signed certificates)
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    if (isDev && url.startsWith("https://localhost")) {
      // In development, ignore certificate errors for localhost
      event.preventDefault();
      callback(true);
    } else {
      // In production, use default behavior (reject invalid certificates)
      callback(false);
    }
  }
);
