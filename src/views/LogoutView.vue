<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { LogOut } from "lucide-vue-next";

// Component for exit view
const router = useRouter();

onMounted(() => {
  // Redirect to login after 3 seconds
  setTimeout(() => {
    router.push("/login");
  }, 3000);
});
</script>

<template>
  <div
    class="fixed inset-0 min-h-screen w-full overflow-hidden flex items-center justify-center z-50">
    <!-- Background Image with Overlay Removed -->

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md px-4 text-center">
      <div class="mb-8 flex justify-center animate-fade-in-up">
        <div class="p-4 glass-panel rounded-full shadow-2xl">
          <LogOut class="w-12 h-12 text-indigo-500 dark:text-white" />
        </div>
      </div>

      <h1
        class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500 mb-6 drop-shadow-lg animate-fade-in-up delay-100">
        {{ $t("common.goodbye") || "¡Hasta pronto!" }}
      </h1>

      <p
        class="text-xl text-gray-600 dark:text-gray-300 font-light tracking-wide mb-8 animate-fade-in-up delay-200">
        {{ $t("common.see_you_soon") || "Esperamos verte de nuevo." }}
      </p>

      <div
        class="w-16 h-1 bg-indigo-500 rounded-full mx-auto animate-pulse"></div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
