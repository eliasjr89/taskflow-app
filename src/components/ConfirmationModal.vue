<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

withDefaults(defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'danger'
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[50000] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- Modal -->
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 animate-fade-in border border-gray-200/50 dark:border-gray-700/50">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {{ title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {{ message }}
          </p>
          
          <div class="flex justify-end gap-3">
            <button
              @click="emit('close')"
              class="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors cursor-pointer">
              {{ cancelText || 'Cancelar' }}
            </button>
            <button
              @click="emit('confirm')"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer">
              {{ confirmText || 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
