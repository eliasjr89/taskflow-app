<script setup lang="ts">
import { useToast } from "../../composables/useToast";

const { toasts, removeToast } = useToast();

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "fa-circle-check";
    case "error":
      return "fa-circle-xmark";
    case "warning":
      return "fa-triangle-exclamation";
    case "info":
      return "fa-circle-info";
    default:
      return "fa-circle-info";
  }
};

const getColorClasses = (type: string) => {
  switch (type) {
    case "success":
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    case "error":
      return "bg-red-500/10 border-red-500/30 text-red-400";
    case "warning":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "info":
      return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    default:
      return "bg-blue-500/10 border-blue-500/30 text-blue-400";
  }
};
</script>

<template>
  <div
    class="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none items-center">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto backdrop-blur-md rounded-xl border shadow-2xl p-4 flex items-start gap-3 w-full max-w-sm',
          getColorClasses(toast.type),
        ]">
        <div class="shrink-0 mt-0.5">
          <i :class="['fa-solid text-xl', getIcon(toast.type)]"></i>
        </div>

        <div class="flex-1 min-w-0 text-left">
          <h4 class="font-bold text-white text-sm mb-1">{{ toast.title }}</h4>
          <p v-if="toast.message" class="text-xs text-gray-300 leading-relaxed">
            {{ toast.message }}
          </p>
        </div>

        <button
          @click="removeToast(toast.id)"
          class="shrink-0 text-white/60 hover:text-white transition-colors ml-2">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  animation: toast-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  animation: toast-out 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}

@keyframes toast-in {
  from {
    transform: translateY(-100px) scale(0.3);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes toast-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
}
</style>
