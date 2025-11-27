"use client";

import { toast as sonnerToast, ExternalToast } from "sonner";

interface ToastOptions extends Omit<ExternalToast, "action" | "cancel"> {
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

// Success toast
export function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    ...options,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
  });
}

// Error toast
export function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    ...options,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
  });
}

// Warning toast
export function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    ...options,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
  });
}

// Info toast
export function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    ...options,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: () => options.action?.onClick(),
        }
      : undefined,
    cancel: options?.cancel
      ? {
          label: options.cancel.label,
          onClick: () => options.cancel?.onClick?.(),
        }
      : undefined,
  });
}

// Loading toast
export function loading(message: string, options?: Omit<ExternalToast, "duration">) {
  return sonnerToast.loading(message, {
    duration: Infinity, // Loading toasts should not auto-dismiss
    ...options,
  });
}

// Promise toast - automatically handles loading, success, and error states
export function promise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return sonnerToast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: options.error,
  });
}

// Dismiss a specific toast
export function dismiss(toastId?: string | number) {
  return sonnerToast.dismiss(toastId);
}

// Dismiss all toasts
export function dismissAll() {
  return sonnerToast.dismiss();
}

// Custom toast with full control
export function custom(message: string, options?: ExternalToast) {
  return sonnerToast(message, options);
}

// Export the toast object with all methods
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  dismiss,
  dismissAll,
  custom,
};
