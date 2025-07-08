import { useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { Product } from "../services/productsService";

export const useCart = () => {
  const { state, dispatch } = useAppContext();

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
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
  };
};
