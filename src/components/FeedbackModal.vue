<script setup lang="ts">
import { CheckCircle2, AlertCircle, XCircle, Info } from "lucide-vue-next";
import { useFeedback } from "../composables/useFeedback";

const { isOpen, title, message, type, closeFeedback } = useFeedback();

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorClasses = {
  success:
    "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  error: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  warning:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
};

const buttonClasses = {
  success: "bg-green-600 hover:bg-green-700 shadow-green-500/30",
  error: "bg-red-600 hover:bg-red-700 shadow-red-500/30",
  warning: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/30",
  info: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50000 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      @click="closeFeedback"></div>

    <!-- Modal -->
    <div
      class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-fade-in border border-gray-200/50 dark:border-gray-700/50 text-center">
      <div
        class="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
        :class="colorClasses[type]">
        <component :is="iconMap[type]" class="w-6 h-6" />
      </div>

      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {{ title }}
      </h3>

      <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        {{ message }}
      </p>

      <button
        @click="closeFeedback"
        class="w-full py-2.5 rounded-xl text-white font-medium shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        :class="buttonClasses[type]">
        {{ $t("common.ok") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
