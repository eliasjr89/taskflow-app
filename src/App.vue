<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { computed, defineAsyncComponent } from "vue";
import MainLayout from "./components/MainLayout.vue";
import AuthLayout from "./layouts/AuthLayout.vue"; // Sync import
import FeedbackModal from "./components/FeedbackModal.vue";

const AdminLayout = defineAsyncComponent(
  () => import("@/layouts/AdminLayout.vue")
);

const route = useRoute();
const layout = computed(() => {
  if (route.meta.layout === "AdminLayout") return AdminLayout;
  if (route.meta.layout === "MainLayout") return MainLayout;
  // Default to AuthLayout to prevent flashing MainLayout (Dashboard) on load/transition
  return AuthLayout;
});
</script>

<template>
  <component :is="layout">
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
  </component>
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
