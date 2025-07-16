import { Product } from "../services/productsService";

// Category interface
export interface Category {
  id: number;
  name: string;
  description?: string;
  product_count: number;
}

// Cart item interface
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number; // price * quantity
}

// User interface
export interface User {
  id?: number;
  name: string;
  role: "cashier" | "manager" | "admin";
  isAuthenticated: boolean;
}

// UI state for loading, modals, etc.
export interface UIState {
  isLoading: boolean;
  currentModal: string | null;
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
  autoClose?: boolean;
}

// Main application state
export interface AppState {
  // Cart state
  cart: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
  };

  // Products cache
  products: {
    items: Product[];
    categories: Category[];
    searchQuery: string;
    selectedCategory: string | null;
    isLoading: boolean;
    lastFetched: number | null;
    recentlyViewed: Product[];
  };

  // User state
  user: User;

  // UI state
  ui: UIState;

  // Settings
  settings: {
    storeName: string;
    taxRate: number;
    currency: string;
    printerName: string | null;
  };
}

// Action types
export type AppAction =
  // Cart actions
  | { type: "ADD_TO_CART"; payload: { product: Product; quantity?: number } }
  | { type: "REMOVE_FROM_CART"; payload: { productId: number } }
  | {
      type: "UPDATE_CART_QUANTITY";
      payload: { productId: number; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "CALCULATE_TOTALS" }
  | { type: "RESTORE_CART"; payload: { cart: AppState["cart"] } }
  | {
      type: "VALIDATE_CART_ITEM";
      payload: { productId: number; currentStock: number };
    }

  // Product actions
  | { type: "SET_PRODUCTS"; payload: { products: Product[] } }
  | { type: "SET_CATEGORIES"; payload: { categories: Category[] } }
  | { type: "SET_PRODUCTS_LOADING"; payload: { isLoading: boolean } }
  | { type: "SET_SEARCH_QUERY"; payload: { query: string } }
  | { type: "SET_SELECTED_CATEGORY"; payload: { category: string | null } }
  | { type: "ADD_PRODUCT"; payload: { product: Product } }
  | { type: "UPDATE_PRODUCT"; payload: { product: Product } }
  | { type: "REMOVE_PRODUCT"; payload: { productId: number } }
  | { type: "ADD_RECENTLY_VIEWED"; payload: { product: Product } }

  // User actions
  | { type: "SET_USER"; payload: { user: User } }
  | { type: "LOGOUT_USER" }

  // UI actions
  | { type: "SET_LOADING"; payload: { isLoading: boolean } }
  | { type: "OPEN_MODAL"; payload: { modalId: string } }
  | { type: "CLOSE_MODAL" }
  | { type: "TOGGLE_SIDEBAR" }
  | {
      type: "ADD_NOTIFICATION";
      payload: { notification: Omit<Notification, "id" | "timestamp"> };
    }
  | { type: "REMOVE_NOTIFICATION"; payload: { notificationId: string } }

  // Settings actions
  | {
      type: "UPDATE_SETTINGS";
      payload: { settings: Partial<AppState["settings"]> };
    };
