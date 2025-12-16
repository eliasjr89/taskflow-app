<script setup lang="ts">
defineProps<{
  show: boolean;
  title?: string;
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
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="$emit('close')"></div>

      <!-- Modal Content -->
      <div
        class="relative bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div
          v-if="title"
          class="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 class="text-xl font-bold text-white">{{ title }}</h3>
          <button
            @click="$emit('close')"
            class="text-text-muted hover:text-white transition-colors">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto custom-scrollbar">
          <slot></slot>
        </div>

        <!-- Footer (Optional slot) -->
        <div
          v-if="$slots.footer"
          class="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
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

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}

.relative {
  transition: all 0.3s ease;
}
</style>
