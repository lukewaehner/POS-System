import { useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { Notification } from "../types/state";

export const useNotifications = () => {
  const { state, dispatch } = useAppContext();

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { notification },
      });
    },
    [dispatch]
  );

  const removeNotification = useCallback(
    (notificationId: string) => {
      dispatch({
        type: "REMOVE_NOTIFICATION",
        payload: { notificationId },
      });
    },
    [dispatch]
  );

  const clearAllNotifications = useCallback(() => {
    state.ui.notifications.forEach((notification) => {
      dispatch({
        type: "REMOVE_NOTIFICATION",
        payload: { notificationId: notification.id },
      });
    });
  }, [dispatch, state.ui.notifications]);

  // Helper methods for different notification types
  const showSuccess = useCallback(
    (message: string, autoClose: boolean = true) => {
      addNotification({
        type: "success",
        message,
        autoClose,
      });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message: string, autoClose: boolean = false) => {
      addNotification({
        type: "error",
        message,
        autoClose,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message: string, autoClose: boolean = true) => {
      addNotification({
        type: "warning",
        message,
        autoClose,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message: string, autoClose: boolean = true) => {
      addNotification({
        type: "info",
        message,
        autoClose,
      });
    },
    [addNotification]
  );

  return {
    // State
    notifications: state.ui.notifications,
    notificationCount: state.ui.notifications.length,
    hasNotifications: state.ui.notifications.length > 0,

    // Actions
    addNotification,
    removeNotification,
    clearAllNotifications,

    // Helper methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
