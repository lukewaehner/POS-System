import { useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { User } from "../types/state";

export const useAuth = () => {
  const { state, dispatch } = useAppContext();

  const login = useCallback(
    (user: Omit<User, "isAuthenticated">) => {
      const authenticatedUser: User = {
        ...user,
        isAuthenticated: true,
      };

      dispatch({
        type: "SET_USER",
        payload: { user: authenticatedUser },
      });

      // Show success notification
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          notification: {
            type: "success",
            message: `Welcome back, ${user.name}!`,
            autoClose: true,
          },
        },
      });
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    const userName = state.user.name;

    dispatch({ type: "LOGOUT_USER" });

    // Show logout notification
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        notification: {
          type: "info",
          message: `${userName} logged out`,
          autoClose: true,
        },
      },
    });
  }, [dispatch, state.user.name]);

  const updateUser = useCallback(
    (userData: Partial<User>) => {
      const updatedUser: User = {
        ...state.user,
        ...userData,
        isAuthenticated: true, // Ensure user stays authenticated
      };

      dispatch({
        type: "SET_USER",
        payload: { user: updatedUser },
      });
    },
    [dispatch, state.user]
  );

  const hasRole = useCallback(
    (role: User["role"]) => {
      return state.user.role === role;
    },
    [state.user.role]
  );

  const hasPermission = useCallback(
    (action: "create" | "read" | "update" | "delete") => {
      if (!state.user.isAuthenticated) return false;

      // Define role permissions
      const permissions = {
        admin: ["create", "read", "update", "delete"],
        manager: ["create", "read", "update", "delete"],
        cashier: ["read"],
      };

      return permissions[state.user.role]?.includes(action) || false;
    },
    [state.user.isAuthenticated, state.user.role]
  );

  return {
    // State
    user: state.user,
    isAuthenticated: state.user.isAuthenticated,
    userRole: state.user.role,
    userName: state.user.name,

    // Actions
    login,
    logout,
    updateUser,

    // Utilities
    hasRole,
    hasPermission,
  };
};
