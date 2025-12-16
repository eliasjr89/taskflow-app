import { ref } from "vue";

export interface Toast {
  id: number;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration: number;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export function useToast() {
  const addToast = (
    type: Toast["type"],
    title: string,
    message: string,
    duration = 4000
  ) => {
    const id = ++toastId;
    const toast: Toast = { id, type, title, message, duration };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (title: string, message = "") => {
    return addToast("success", title, message);
  };

  const error = (title: string, message = "") => {
    return addToast("error", title, message, 5000);
  };

  const warning = (title: string, message = "") => {
    return addToast("warning", title, message);
  };

  const info = (title: string, message = "") => {
    return addToast("info", title, message);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
