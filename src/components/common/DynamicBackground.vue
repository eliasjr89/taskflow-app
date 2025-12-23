<script setup lang="ts">
import { computed } from "vue";
import { useSectionTheme } from "@/composables/useSectionTheme";

const { theme } = useSectionTheme();

// Accedemos a los gradientes desde el tema
const gradientColors = computed(() => theme.value.gradients);
</script>

<template>
  <div
    class="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gray-50 dark:bg-gray-950 transition-colors duration-700">
    <!-- Blobs de gradiente animados -->
    <div class="absolute inset-0 opacity-80 dark:opacity-40">
      <!-- Top Left Blob -->
      <div
        class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[80px] md:blur-[120px] transition-all duration-1000 ease-in-out bg-linear-to-br animate-blob"
        :class="gradientColors.blob1"></div>

      <!-- Bottom Right Blob -->
      <div
        class="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[80px] md:blur-[120px] transition-all duration-1000 ease-in-out bg-linear-to-tl animate-blob animation-delay-2000"
        :class="gradientColors.blob2"></div>

      <!-- Center / Floating Blob -->
      <div
        class="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full blur-[100px] transition-all duration-1000 ease-in-out bg-linear-to-r animate-blob animation-delay-4000 opacity-60"
        :class="gradientColors.blob3"></div>
    </div>

    <!-- Filtro de ruido sutil para textura (Glassmorphism premium) -->
    <div
      class="absolute inset-0 opacity-20 dark:opacity-10 bg-noise mix-blend-overlay"></div>
  </div>
</template>

<style scoped>
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 10s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
