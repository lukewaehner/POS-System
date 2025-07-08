// Export all custom hooks
export { useCart } from "./useCart";
export { useProducts } from "./useProducts";
export { useAuth } from "./useAuth";
export { useNotifications } from "./useNotifications";

// Export context and provider
export { AppProvider, useAppContext } from "../context/AppContext";

// Export types
export type {
  AppState,
  AppAction,
  CartItem,
  User,
  Notification,
} from "../types/state";
