import { ref } from "vue";

type FeedbackType = "success" | "error" | "warning" | "info";

const isOpen = ref(false);
const title = ref("");
const message = ref("");
const type = ref<FeedbackType>("success");
const onConfirm = ref<(() => void) | null>(null);

export function useFeedback() {
  function showFeedback(
    newTitle: string,
    newMessage: string,
    newType: FeedbackType = "success",
    newOnConfirm?: () => void
  ) {
    title.value = newTitle;
    message.value = newMessage;
    type.value = newType;
    if (newOnConfirm) {
      onConfirm.value = newOnConfirm;
    } else {
      onConfirm.value = null;
    }
    isOpen.value = true;
  }

  function closeFeedback() {
    isOpen.value = false;
    // Reset after closing animation ideally, but here is fine
    setTimeout(() => {
      title.value = "";
      message.value = "";
      onConfirm.value = null;
    }, 300);
  }

  return {
    isOpen,
    title,
    message,
    type,
    showFeedback,
    closeFeedback,
  };
}
