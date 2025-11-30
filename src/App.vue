<script setup lang="ts">
import { RouterView } from 'vue-router';
import MainLayout from './components/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <RouterView v-slot="{ Component }">
      <transition 
        name="fade" 
        mode="out-in"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 translate-y-2">
        <component :is="Component" />
      </transition>
    </RouterView>
  </MainLayout>
</template>
