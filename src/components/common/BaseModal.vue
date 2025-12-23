<script setup lang="ts">
import { X } from "lucide-vue-next";

defineProps<{
  show: boolean;
  title?: string;
  maxWidth?: string;
}>();

defineEmits(["close"]);
</script>

<template>
  <transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"></div>

      <!-- Modal Content -->
      <div
        class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-all transform"
        :class="[maxWidth || 'max-w-lg']">
        <!-- Header -->
        <div
          v-if="title"
          class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto custom-scrollbar">
          <slot></slot>
        </div>

        <!-- Footer (Optional slot) -->
        <div
          v-if="$slots.footer"
          class="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-2xl">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
