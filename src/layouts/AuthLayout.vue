<script setup lang="ts">
import DynamicBackground from "@/components/common/DynamicBackground.vue";
import ToastNotification from "@/components/common/ToastNotification.vue";
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Background for Auth Pages -->
    <DynamicBackground />

    <!-- Content -->
    <div
      class="relative z-10 w-full min-h-screen flex items-center justify-center">
      <slot />
    </div>

    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>
