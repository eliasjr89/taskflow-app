import { ref } from "vue";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

interface ConfirmDialog extends ConfirmOptions {
  id: number;
  resolve: (value: boolean) => void;
}

const dialogs = ref<ConfirmDialog[]>([]);
let dialogId = 0;

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = ++dialogId;
      dialogs.value.push({
        id,
        ...options,
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
        type: options.type || "warning",
        resolve,
      });
    });
  };

  const handleConfirm = (id: number) => {
    const dialog = dialogs.value.find((d) => d.id === id);
    if (dialog) {
      dialog.resolve(true);
      dialogs.value = dialogs.value.filter((d) => d.id !== id);
    }
  };

  const handleCancel = (id: number) => {
    const dialog = dialogs.value.find((d) => d.id === id);
    if (dialog) {
      dialog.resolve(false);
      dialogs.value = dialogs.value.filter((d) => d.id !== id);
    }
  };

  return {
    dialogs,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
