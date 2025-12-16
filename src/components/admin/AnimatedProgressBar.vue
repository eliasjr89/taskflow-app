<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps<{
  percentage: number;
  colorClass?: string; // e.g. 'bg-blue-500' or gradient
  bgClass?: string;
}>();

const currentWidth = ref(0);

onMounted(() => {
  // Start animation after mount
  setTimeout(() => {
    currentWidth.value = props.percentage;
  }, 100);
});

watch(
  () => props.percentage,
  (newVal) => {
    currentWidth.value = newVal;
  }
);
</script>

<template>
  <div
    :class="[
      'w-full rounded-full h-2 overflow-hidden',
      bgClass || 'bg-slate-700/30',
    ]">
    <div
      :class="[
        'h-full rounded-full transition-all duration-1000 ease-out',
        colorClass || 'bg-blue-500',
      ]"
      :style="{ width: `${Math.min(currentWidth, 100)}%` }"></div>
  </div>
</template>
