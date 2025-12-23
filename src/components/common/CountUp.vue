<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  to: number;
  duration?: number;
}>();

const current = ref(0);
const duration = props.duration || 1500;

const animate = () => {
  const start = 0;
  const end = props.to;
  const startTime = performance.now();

  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);
    
    current.value = Math.floor(start + (end - start) * ease);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      current.value = end;
    }
  };

  requestAnimationFrame(update);
};

onMounted(() => {
  animate();
});

watch(() => props.to, () => {
  animate();
});
</script>

<template>
  <span>{{ current }}</span>
</template>
