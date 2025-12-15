<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";

withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    buttonText?: string;
  }>(),
  {
    // buttonText default removed to handle in template
  }
);

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50000 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      @click="emit('close')"></div>

    <!-- Modal -->
    <div
      class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-fade-in border border-gray-200/50 dark:border-gray-700/50 text-center">
      <div
        class="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 class="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>

      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {{ title }}
      </h3>

      <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        {{ message }}
      </p>

      <button
        @click="emit('close')"
        class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer">
        {{ buttonText || $t("common.ok") }}
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
