<script setup lang="ts">
import { useConfirm } from "../../composables/useConfirm";

const { dialogs, handleConfirm, handleCancel } = useConfirm();

const getTypeClasses = (type?: string) => {
  switch (type) {
    case "danger":
      return {
        icon: "fa-triangle-exclamation",
        iconColor: "text-red-400",
        iconBg: "bg-red-500/10",
        confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      };
    case "warning":
      return {
        icon: "fa-circle-exclamation",
        iconColor: "text-yellow-400",
        iconBg: "bg-yellow-500/10",
        confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      };
    case "success":
      return {
        icon: "fa-circle-check",
        iconColor: "text-green-400",
        iconBg: "bg-green-500/10",
        confirmBtn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      };
    default:
      return {
        icon: "fa-circle-info",
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10",
        confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      };
  }
};
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="dialog">
      <div
        v-for="dialog in dialogs"
        :key="dialog.id"
        class="fixed inset-0 z-9999 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="handleCancel(dialog.id)"></div>

        <!-- Dialog -->
        <div
          class="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full overflow-hidden animate-scale-in">
          <!-- Icon -->
          <div class="p-6 pb-4">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                getTypeClasses(dialog.type).iconBg,
              ]">
              <i
                :class="[
                  'fa-solid text-3xl',
                  getTypeClasses(dialog.type).icon,
                  getTypeClasses(dialog.type).iconColor,
                ]"></i>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-bold text-white text-center mb-2">
              {{ dialog.title }}
            </h3>

            <!-- Message -->
            <p class="text-gray-300 text-center">
              {{ dialog.message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 p-6 pt-2 bg-slate-800/50">
            <button
              @click="handleCancel(dialog.id)"
              class="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-200 font-medium">
              {{ dialog.cancelText }}
            </button>
            <button
              @click="handleConfirm(dialog.id)"
              :class="[
                'flex-1 px-4 py-3 rounded-lg text-white font-bold transition-all duration-200 shadow-lg',
                getTypeClasses(dialog.type).confirmBtn,
              ]">
              {{ dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.animate-scale-in {
  animation: none; /* Handled by transition */
}
</style>
