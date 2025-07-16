import { AppState, AppAction, CartItem, Notification } from "../types/state";
import { sanitizeCart } from "../utils/cartValidation";

// Calculate cart totals helper
const calculateCartTotals = (items: CartItem[], taxRate: number) => {
  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return { subtotal, tax, total };
};

// Generate unique ID for notifications
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Cart actions
    case "ADD_TO_CART": {
      const { product, quantity = 1 } = action.payload;

      // Validation: Check if product is valid
      if (
        !product ||
        !product.id ||
        !product.name ||
        typeof product.price !== "number" ||
        product.price < 0
      ) {
        console.error("Invalid product data:", product);
        return state;
      }

      // Validation: Check if quantity is valid
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        console.error("Invalid quantity:", quantity);
        return state;
      }

      // Validation: Check stock availability
      const availableStock = product.stock_quantity || 0;
      if (availableStock <= 0) {
        console.error("Product out of stock:", product.name);
        return state;
      }

      const existingItemIndex = state.cart.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity with stock validation
        const existingItem = state.cart.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        // Validation: Don't exceed available stock
        const validQuantity = Math.min(newQuantity, availableStock);

        newItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: validQuantity,
                subtotal: validQuantity * product.price,
              }
            : item
        );
      } else {
        // Add new item with stock validation
        const validQuantity = Math.min(quantity, availableStock);
        const newItem: CartItem = {
          id: Date.now(),
          product,
          quantity: validQuantity,
          subtotal: validQuantity * product.price,
        };
        newItems = [...state.cart.items, newItem];
      }

      const totals = calculateCartTotals(newItems, state.settings.taxRate);

      return {
        ...state,
        cart: {
          items: newItems,
          ...totals,
        },
      };
    }

    case "REMOVE_FROM_CART": {
      const { productId } = action.payload;
      const newItems = state.cart.items.filter(
        (item) => item.product.id !== productId
      );
      const totals = calculateCartTotals(newItems, state.settings.taxRate);

      return {
        ...state,
        cart: {
          items: newItems,
          ...totals,
        },
      };
    }

    case "UPDATE_CART_QUANTITY": {
      const { productId, quantity } = action.payload;

      // Validation: Check if quantity is valid
      if (!Number.isInteger(quantity) || quantity < 0) {
        console.error("Invalid quantity:", quantity);
        return state;
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return appReducer(state, {
          type: "REMOVE_FROM_CART",
          payload: { productId },
        });
      }

      // Find the item to validate stock
      const itemToUpdate = state.cart.items.find(
        (item) => item.product.id === productId
      );

      if (!itemToUpdate) {
        console.error("Item not found in cart:", productId);
        return state;
      }

      // Validation: Check stock availability
      const availableStock = itemToUpdate.product.stock_quantity || 0;
      const validQuantity = Math.min(quantity, availableStock);

      // Validation: Check minimum quantity (for some businesses)
      const minQuantity = 1; // Could be configurable in settings
      const finalQuantity = Math.max(validQuantity, minQuantity);

      const newItems = state.cart.items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: finalQuantity,
              subtotal: finalQuantity * item.product.price,
            }
          : item
      );

      const totals = calculateCartTotals(newItems, state.settings.taxRate);

      return {
        ...state,
        cart: {
          items: newItems,
          ...totals,
        },
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        cart: {
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      };
    }

    case "CALCULATE_TOTALS": {
      const totals = calculateCartTotals(
        state.cart.items,
        state.settings.taxRate
      );
      return {
        ...state,
        cart: {
          ...state.cart,
          ...totals,
        },
      };
    }

    case "RESTORE_CART": {
      const { cart } = action.payload;
      // Validate and sanitize restored cart items using comprehensive validation
      const sanitizedItems = sanitizeCart(cart.items);

      // Recalculate totals to ensure accuracy
      const totals = calculateCartTotals(
        sanitizedItems,
        state.settings.taxRate
      );

      return {
        ...state,
        cart: {
          items: sanitizedItems,
          ...totals,
        },
      };
    }

    case "VALIDATE_CART_ITEM": {
      const { productId, currentStock } = action.payload;

      const updatedItems = state.cart.items.map((item) => {
        if (item.product.id === productId) {
          // Adjust quantity if it exceeds current stock
          const validQuantity = Math.min(item.quantity, currentStock);
          return {
            ...item,
            quantity: validQuantity,
            subtotal: validQuantity * item.product.price,
          };
        }
        return item;
      });

      const totals = calculateCartTotals(updatedItems, state.settings.taxRate);

      return {
        ...state,
        cart: {
          items: updatedItems,
          ...totals,
        },
      };
    }

    // Product actions
    case "SET_PRODUCTS": {
      return {
        ...state,
        products: {
          ...state.products,
          items: action.payload.products,
          lastFetched: Date.now(),
          isLoading: false,
        },
      };
    }

    case "SET_CATEGORIES": {
      return {
        ...state,
        products: {
          ...state.products,
          categories: action.payload.categories,
        },
      };
    }

    case "SET_PRODUCTS_LOADING": {
      return {
        ...state,
        products: {
          ...state.products,
          isLoading: action.payload.isLoading,
        },
      };
    }

    case "SET_SEARCH_QUERY": {
      return {
        ...state,
        products: {
          ...state.products,
          searchQuery: action.payload.query,
        },
      };
    }

    case "SET_SELECTED_CATEGORY": {
      return {
        ...state,
        products: {
          ...state.products,
          selectedCategory: action.payload.category,
        },
      };
    }

    case "UPDATE_PRODUCT": {
      const { product } = action.payload;
      const updatedItems = state.products.items.map((p) =>
        p.id === product.id ? product : p
      );

      // Update cart items if product was updated
      const updatedCartItems = state.cart.items.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              product,
              subtotal: item.quantity * product.price,
            }
          : item
      );

      const totals = calculateCartTotals(
        updatedCartItems,
        state.settings.taxRate
      );

      return {
        ...state,
        products: {
          ...state.products,
          items: updatedItems,
        },
        cart: {
          items: updatedCartItems,
          ...totals,
        },
      };
    }

    case "REMOVE_PRODUCT": {
      const { productId } = action.payload;

      // Remove product from products list
      const updatedItems = state.products.items.filter(
        (p) => p.id !== productId
      );

      // Remove product from cart if it exists
      const updatedCartItems = state.cart.items.filter(
        (item) => item.product.id !== productId
      );

      // Remove product from recently viewed if it exists
      const updatedRecentlyViewed = state.products.recentlyViewed.filter(
        (p) => p.id !== productId
      );

      const totals = calculateCartTotals(
        updatedCartItems,
        state.settings.taxRate
      );

      return {
        ...state,
        products: {
          ...state.products,
          items: updatedItems,
          recentlyViewed: updatedRecentlyViewed,
        },
        cart: {
          items: updatedCartItems,
          ...totals,
        },
      };
    }

    case "ADD_RECENTLY_VIEWED": {
      const { product } = action.payload;

      // Remove product if it already exists in recently viewed
      const filteredRecentlyViewed = state.products.recentlyViewed.filter(
        (p) => p.id !== product.id
      );

      // Add product to the beginning of the array
      const updatedRecentlyViewed = [product, ...filteredRecentlyViewed];

      // Keep only the last 8 products
      const limitedRecentlyViewed = updatedRecentlyViewed.slice(0, 8);

      return {
        ...state,
        products: {
          ...state.products,
          recentlyViewed: limitedRecentlyViewed,
        },
      };
    }

    // User actions
    case "SET_USER": {
      return {
        ...state,
        user: action.payload.user,
      };
    }

    case "LOGOUT_USER": {
      return {
        ...state,
        user: {
          name: "",
          role: "cashier",
          isAuthenticated: false,
        },
        cart: {
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      };
    }

    // UI actions
    case "SET_LOADING": {
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload.isLoading,
        },
      };
    }

    case "OPEN_MODAL": {
      return {
        ...state,
        ui: {
          ...state.ui,
          currentModal: action.payload.modalId,
        },
      };
    }

    case "CLOSE_MODAL": {
      return {
        ...state,
        ui: {
          ...state.ui,
          currentModal: null,
        },
      };
    }

    case "TOGGLE_SIDEBAR": {
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };
    }

    case "ADD_NOTIFICATION": {
      const notification: Notification = {
        ...action.payload.notification,
        id: generateId(),
        timestamp: Date.now(),
      };

      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, notification],
        },
      };
    }

    case "REMOVE_NOTIFICATION": {
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            (n) => n.id !== action.payload.notificationId
          ),
        },
      };
    }

    // Settings actions
    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload.settings };

      // Recalculate cart totals if tax rate changed
      const totals =
        newSettings.taxRate !== state.settings.taxRate
          ? calculateCartTotals(state.cart.items, newSettings.taxRate)
          : {
              subtotal: state.cart.subtotal,
              tax: state.cart.tax,
              total: state.cart.total,
            };

      return {
        ...state,
        settings: newSettings,
        cart: {
          ...state.cart,
          ...totals,
        },
      };
    }

    default:
      return state;
  }
};
