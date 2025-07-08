import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { AppState, AppAction } from "../types/state";
import { appReducer } from "./appReducer";

// Initial state
const initialState: AppState = {
  cart: {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  },
  products: {
    items: [],
    categories: [],
    searchQuery: "",
    selectedCategory: null,
    isLoading: false,
    lastFetched: null,
  },
  user: {
    name: "",
    role: "cashier",
    isAuthenticated: false,
  },
  ui: {
    isLoading: false,
    currentModal: null,
    sidebarOpen: false,
    notifications: [],
  },
  settings: {
    storeName: "POS System",
    taxRate: 0.08, // 8% default tax rate
    currency: "USD",
    printerName: null,
  },
};

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const autoCloseNotifications = state.ui.notifications.filter(
      (notification) => notification.autoClose !== false
    );

    if (autoCloseNotifications.length > 0) {
      autoCloseNotifications.forEach((notification) => {
        const timeElapsed = Date.now() - notification.timestamp;
        const remainingTime = 5000 - timeElapsed; // 5 seconds

        if (remainingTime > 0) {
          setTimeout(() => {
            dispatch({
              type: "REMOVE_NOTIFICATION",
              payload: { notificationId: notification.id },
            });
          }, remainingTime);
        } else {
          // Notification is already overdue, remove immediately
          dispatch({
            type: "REMOVE_NOTIFICATION",
            payload: { notificationId: notification.id },
          });
        }
      });
    }
  }, [state.ui.notifications]);

  // Load settings from localStorage on app start
  useEffect(() => {
    const savedSettings = localStorage.getItem("pos-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: "UPDATE_SETTINGS",
          payload: { settings },
        });
      } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pos-settings", JSON.stringify(state.settings));
  }, [state.settings]);

  // Load user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("pos-user-session");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.isAuthenticated) {
          dispatch({
            type: "SET_USER",
            payload: { user },
          });
        }
      } catch (error) {
        console.error("Failed to load user session from localStorage:", error);
      }
    }
  }, []);

  // Save user session to localStorage when it changes
  useEffect(() => {
    if (state.user.isAuthenticated) {
      localStorage.setItem("pos-user-session", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("pos-user-session");
    }
  }, [state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
