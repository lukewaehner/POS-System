import { AppState, AppAction, CartItem, Notification } from "../types/state";

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
      const existingItemIndex = state.cart.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * product.price,
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now(),
          product,
          quantity,
          subtotal: quantity * product.price,
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

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return appReducer(state, {
          type: "REMOVE_FROM_CART",
          payload: { productId },
        });
      }

      const newItems = state.cart.items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price,
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
