<script setup lang="ts">
import Sidebar from "@/components/admin/AdminSidebar.vue";
import Header from "@/components/admin/Header.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div
    class="flex min-h-screen text-white font-sans selection:bg-primary selection:text-white">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main
      class="flex-1 md:ml-[260px] p-0 md:p-8 pb-20 md:pb-8 h-screen overflow-y-auto no-scrollbar bg-bg-dark">
      <!-- Header Banner (Adaptive) -->
      <div
        v-if="route.name !== 'AdminProfile' && route.name !== 'Profile'"
        class="px-4 mt-4 md:mt-0 md:px-0">
        <Header />
      </div>

      <!-- Page Content -->
      <div class="fade-in px-4 py-4 md:px-0 md:py-0">
        <slot />
      </div>
    </main>

    <ToastNotification />
  </div>
</template>

<style>
.fade-enter-active {
  animation: fadeIn 0.4s ease-out;
}

.fade-leave-active {
  animation: fadeIn 0.3s ease-in reverse;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
