<script setup lang="ts">
import Header from "@/components/layout/Header.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import DynamicBackground from "@/components/common/DynamicBackground.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
import { useRoute } from "vue-router";
import { computed, onMounted, onUnmounted } from "vue";
import socketService from "@/services/socket";
import { useTaskStore } from "@/stores/tasks";

const route = useRoute();
const isPublic = computed(() => route.meta.public === true);
const taskStore = useTaskStore();

onMounted(() => {
  if (!isPublic.value) {
    socketService.connect();

    socketService.on("task:created", (newTask: any) => {
      taskStore.handleSocketTaskCreate(newTask);
    });

    socketService.on("task:updated", (updatedTask: any) => {
      taskStore.handleSocketTaskUpdate(updatedTask);
    });

    socketService.on("task:deleted", (taskId: string | number) => {
      taskStore.removeTask(Number(taskId));
    });
  }
});

onUnmounted(() => {
  socketService.disconnect();
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-500 relative">
    <DynamicBackground />

    <div class="relative z-10 flex flex-col min-h-screen">
      <!-- Layout Container -->
      <div
        class="flex flex-1 flex-col md:flex-row gap-0 w-full"
        :class="{ 'p-0 md:p-0': !isPublic }">
        <!-- Removed standard padding to let Sidebar/Header handle spacing like Admin -->

        <AppSidebar v-if="!isPublic" />

        <main
          class="flex-1 flex flex-col w-full min-w-0 px-4 md:px-8 pb-24 md:pb-8 h-auto md:h-screen overflow-visible md:overflow-y-auto no-scrollbar">
          <!-- Header Banner inside Main -->
          <Header v-if="!isPublic" />

          <!-- Content -->
          <div class="fade-in">
            <slot />
          </div>
        </main>
      </div>

      <BottomNav v-if="!isPublic" />
    </div>

    <!-- Toast Notifications persistent across layout -->
    <ToastNotification />
  </div>
</template>
