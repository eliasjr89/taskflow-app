<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { computed, defineAsyncComponent, onMounted, watch } from "vue";
import AppLayout from "./layouts/AppLayout.vue";
import AuthLayout from "./layouts/AuthLayout.vue";
import FeedbackModal from "./components/common/FeedbackModal.vue";
import ConfirmDialog from "./components/common/ConfirmDialog.vue";
import { useSocket } from "@/composables/useSocket";
import { useAuthStore } from "@/stores/auth";

const AdminLayout = defineAsyncComponent(
  () => import("@/layouts/AdminLayout.vue")
);

const route = useRoute();
const layout = computed(() => {
  if (route.meta.layout === "AdminLayout") return AdminLayout;
  if (route.meta.layout === "AppLayout") return AppLayout;
  // Default to AuthLayout to prevent flashing MainLayout (Dashboard) on load/transition
  return AuthLayout;
});

// Global Socket Connection
const { connect, disconnect } = useSocket();
const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAuthenticated) {
    connect();
  }
});

watch(
  () => authStore.isAuthenticated,
  (val) => {
    if (val) connect();
    else disconnect();
  }
);
</script>

<template>
  <component :is="layout">
    <RouterView v-slot="{ Component, route }">
      <transition
        :name="(route.meta.transition as string) || 'page'"
        mode="out-in"
        enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        enter-from-class="transform opacity-0 scale-95 translate-y-8"
        enter-to-class="transform opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 cubic-bezier(0.36, 0, 0.66, -0.56)"
        leave-from-class="transform opacity-100 scale-100 translate-y-0"
        leave-to-class="transform opacity-0 scale-105 -translate-y-8">
        <component :is="Component" :key="route.path" />
      </transition>
    </RouterView>
    <FeedbackModal />
    <ConfirmDialog />
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
