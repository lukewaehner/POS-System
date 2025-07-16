import { useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { Product } from "../services/productsService";
import {
  validateProduct,
  validateQuantity,
  validateCart,
  getMaxQuantityForProduct,
  CartValidationResult,
} from "../utils/cartValidation";

export const useCart = () => {
  const { state, dispatch } = useAppContext();

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      console.log("🛒 addToCart called:", {
        productId: product.id,
        productName: product.name,
        quantity,
        timestamp: new Date().toISOString(),
        callStack: new Error().stack?.split("\n").slice(1, 5),
      });

      dispatch({
        type: "ADD_TO_CART",
        payload: { product, quantity },
      });

      // Show success notification
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          notification: {
            type: "success",
            message: `${product.name} added to cart`,
            autoClose: true,
          },
        },
      });

      console.log("🛒 addToCart completed for:", product.name);
    },
    [dispatch]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      const item = state.cart.items.find(
        (item) => item.product.id === productId
      );

      dispatch({
        type: "REMOVE_FROM_CART",
        payload: { productId },
      });

      if (item) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "info",
              message: `${item.product.name} removed from cart`,
              autoClose: true,
            },
          },
        });
      }
    },
    [dispatch, state.cart.items]
  );

  const updateCartQuantity = useCallback(
    (productId: number, quantity: number) => {
      dispatch({
        type: "UPDATE_CART_QUANTITY",
        payload: { productId, quantity },
      });
    },
    [dispatch]
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });

    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        notification: {
          type: "info",
          message: "Cart cleared",
          autoClose: true,
        },
      },
    });
  }, [dispatch]);

  const getCartItemCount = useCallback(() => {
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.cart.items]);

  const getCartItem = useCallback(
    (productId: number) => {
      return state.cart.items.find((item) => item.product.id === productId);
    },
    [state.cart.items]
  );

  const isInCart = useCallback(
    (productId: number) => {
      return state.cart.items.some((item) => item.product.id === productId);
    },
    [state.cart.items]
  );

  // Validation methods
  const validateProductForCart = useCallback(
    (product: Product): CartValidationResult => {
      return validateProduct(product);
    },
    []
  );

  const validateQuantityForProduct = useCallback(
    (quantity: number, product: Product): CartValidationResult => {
      return validateQuantity(quantity, product);
    },
    []
  );

  const validateCurrentCart = useCallback((): CartValidationResult => {
    return validateCart(state.cart.items);
  }, [state.cart.items]);

  const getMaxQuantity = useCallback(
    (product: Product): number => {
      const currentItem = getCartItem(product.id);
      const currentQuantity = currentItem ? currentItem.quantity : 0;
      return getMaxQuantityForProduct(product, currentQuantity);
    },
    [getCartItem]
  );

  const canAddToCart = useCallback(
    (product: Product, quantity: number = 1): boolean => {
      const productValidation = validateProductForCart(product);
      const quantityValidation = validateQuantityForProduct(quantity, product);
      const maxQuantity = getMaxQuantity(product);

      return (
        productValidation.isValid &&
        quantityValidation.isValid &&
        quantity <= maxQuantity
      );
    },
    [validateProductForCart, validateQuantityForProduct, getMaxQuantity]
  );

  const getCartValidationErrors = useCallback((): string[] => {
    const validation = validateCurrentCart();
    return validation.errors;
  }, [validateCurrentCart]);

  const getCartValidationWarnings = useCallback((): string[] => {
    const validation = validateCurrentCart();
    return validation.warnings;
  }, [validateCurrentCart]);

  // Enhanced add to cart with validation feedback
  const addToCartWithValidation = useCallback(
    (product: Product, quantity: number = 1) => {
      const productValidation = validateProductForCart(product);
      const quantityValidation = validateQuantityForProduct(quantity, product);

      // Show validation errors
      if (!productValidation.isValid) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "error",
              message: productValidation.errors.join(", "),
              autoClose: false,
            },
          },
        });
        return false;
      }

      if (!quantityValidation.isValid) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "error",
              message: quantityValidation.errors.join(", "),
              autoClose: false,
            },
          },
        });
        return false;
      }

      // Show validation warnings
      const allWarnings = [
        ...productValidation.warnings,
        ...quantityValidation.warnings,
      ];
      if (allWarnings.length > 0) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            notification: {
              type: "warning",
              message: allWarnings.join(", "),
              autoClose: true,
            },
          },
        });
      }

      // Proceed with adding to cart
      addToCart(product, quantity);
      return true;
    },
    [dispatch, validateProductForCart, validateQuantityForProduct, addToCart]
  );

  return {
    // State
    cartItems: state.cart.items,
    cartSubtotal: state.cart.subtotal,
    cartTax: state.cart.tax,
    cartTotal: state.cart.total,

    // Actions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,

    // Utilities
    getCartItemCount,
    getCartItem,
    isInCart,

    // Validation methods
    validateProductForCart,
    validateQuantityForProduct,
    validateCurrentCart,
    getMaxQuantity,
    canAddToCart,
    getCartValidationErrors,
    getCartValidationWarnings,
    addToCartWithValidation,
  };
};
