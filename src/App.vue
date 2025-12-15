<script setup lang="ts">
import { RouterView } from "vue-router";
import MainLayout from "./components/MainLayout.vue";
import FeedbackModal from "./components/FeedbackModal.vue";
</script>

<template>
  <MainLayout>
    <RouterView v-slot="{ Component, route }">
      <transition
        :name="(route.meta.transition as string) || 'fade'"
        mode="out-in"
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="transform opacity-0 scale-95 translate-y-4"
        enter-to-class="transform opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="transform opacity-100 scale-100 translate-y-0"
        leave-to-class="transform opacity-0 scale-95 -translate-y-4">
        <component :is="Component" :key="route.path" />
      </transition>
    </RouterView>
    <FeedbackModal />
  </MainLayout>
</template>

<style>
/* Transiciones adicionales para rutas específicas */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
