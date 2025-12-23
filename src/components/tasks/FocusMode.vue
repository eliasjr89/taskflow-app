<script setup lang="ts">
import { ref, onUnmounted, computed } from "vue";
import type { Task } from "@/types/global";
import { X, Play, Pause, Square, CheckCircle2 } from "lucide-vue-next";

const props = defineProps<{
  task: Task | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "complete", task: Task): void;
}>();

const isRunning = ref(false);
const seconds = ref(25 * 60); // 25 minutes default pomodoro
const initialSeconds = 25 * 60;
const intervalId = ref<number | null>(null);

const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60);
  const s = seconds.value % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
});

const progress = computed(() => {
  return ((initialSeconds - seconds.value) / initialSeconds) * 100;
});

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer();
  } else {
    startTimer();
  }
};

const startTimer = () => {
  isRunning.value = true;
  intervalId.value = window.setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--;
    } else {
      pauseTimer();
      // Play sound or notification here
    }
  }, 1000);
};

const pauseTimer = () => {
  isRunning.value = false;
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

const resetTimer = () => {
  pauseTimer();
  seconds.value = initialSeconds;
};

const handleComplete = () => {
  if (props.task) {
    emit("complete", props.task);
    emit("close");
  }
};

onUnmounted(() => {
  if (intervalId.value) clearInterval(intervalId.value);
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen && task"
      class="fixed inset-0 z-300 flex items-center justify-center p-4">
      <!-- Backdrop with blur -->
      <div
        class="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        @click="emit('close')"></div>

      <!-- Focus Modal -->
      <div
        class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-scale-in border border-white/10">
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>

        <!-- Task Title -->
        <h2
          class="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2 font-heading">
          Focus Mode
        </h2>
        <p
          class="text-gray-500 dark:text-gray-400 text-center mb-8 px-4 line-clamp-2">
          {{ task.title }}
        </p>

        <!-- Timer Circle -->
        <div class="relative w-64 h-64 flex items-center justify-center mb-8">
          <!-- SVG Ring -->
          <svg class="absolute inset-0 transform -rotate-90 w-full h-full">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              stroke-width="8"
              fill="transparent"
              class="text-gray-200 dark:text-gray-800" />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              stroke-width="8"
              fill="transparent"
              :stroke-dasharray="2 * Math.PI * 120"
              :stroke-dashoffset="2 * Math.PI * 120 * (1 - progress / 100)"
              class="text-indigo-500 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              stroke-linecap="round" />
          </svg>

          <!-- Time Text -->
          <div
            class="text-6xl font-bold font-mono tracking-wider text-gray-900 dark:text-white tabular-nums z-10">
            {{ formattedTime }}
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-6 mb-8">
          <button
            @click="resetTimer"
            class="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Reset">
            <Square class="w-6 h-6" />
          </button>

          <button
            @click="toggleTimer"
            class="p-6 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-500/30">
            <Pause v-if="isRunning" class="w-8 h-8 fill-current" />
            <Play v-else class="w-8 h-8 ml-1 fill-current" />
          </button>
        </div>

        <!-- Complete Button -->
        <button
          @click="handleComplete"
          class="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors font-semibold">
          <CheckCircle2 class="w-5 h-5" />
          Mark as Completed
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
