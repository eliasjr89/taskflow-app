<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTaskStore } from "../stores/tasks";
import { storeToRefs } from "pinia";
import { useTasks } from "../composables/useTask";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import SkeletonLoader from "../components/common/SkeletonLoader.vue";
import {
  CheckCircle2,
  Clock,
  Target,
  ListTodo,
  ArrowRight,
  Folder,
} from "lucide-vue-next";

import { useAnimatedNumber } from "../composables/useAnimatedNumber";

const taskStore = useTaskStore();

const { tasks, pendingTasks, completedTasks } = storeToRefs(taskStore);

const { loadTask, toggleTaskCompletion } = useTasks();

const { t } = useI18n();
const isLoading = ref(true);

onMounted(async () => {
  // Initial fetch
  try {
    await loadTask();
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
});

// Estadísticas
const totalTasks = computed(() => tasks.value.length);
const completedCount = computed(() => completedTasks.value.length);
const pendingCount = computed(() => pendingTasks.value.length);

const completionRate = computed(() =>
  totalTasks.value > 0
    ? Math.round((completedCount.value / totalTasks.value) * 100)
    : 0
);

// Animated Stats
const animatedTotal = useAnimatedNumber(totalTasks);
const animatedCompleted = useAnimatedNumber(completedCount);
const animatedPending = useAnimatedNumber(pendingCount);
const animatedRate = useAnimatedNumber(completionRate);

// Tareas recientes (últimas 5)
const recentTasks = computed(() => tasks.value.slice(0, 5));
</script>

<template>
  <div class="flex-1 w-full animate-fade-in pb-20 md:pb-0">
    <!-- SKELETON LOADING -->
    <div v-if="isLoading" class="space-y-6">
      <SkeletonLoader type="card" :count="4" />
      <SkeletonLoader type="banner" class="h-32!" />
      <SkeletonLoader type="list" :count="5" />
    </div>

    <!-- MAIN CONTENT -->
    <div v-else class="space-y-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Tasks -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center gap-4 shadow-sm group hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between w-full">
            <div
              class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <ListTodo class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p
              class="text-3xl font-bold text-gray-900 dark:text-gray-100 font-heading">
              {{ animatedTotal }}
            </p>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ t("dashboard.total_tasks") }}
          </p>
        </div>

        <!-- Completed -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center gap-4 shadow-sm group hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between w-full">
            <div
              class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2
                class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p
              class="text-3xl font-bold text-gray-900 dark:text-gray-100 font-heading">
              {{ animatedCompleted }}
            </p>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ t("dashboard.completed") }}
          </p>
        </div>

        <!-- Pending -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center gap-4 shadow-sm group hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between w-full">
            <div
              class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Clock class="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p
              class="text-3xl font-bold text-gray-900 dark:text-gray-100 font-heading">
              {{ animatedPending }}
            </p>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ t("dashboard.pending") }}
          </p>
        </div>

        <!-- Success Rate -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col justify-center gap-4 shadow-sm group hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between w-full">
            <div
              class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Target class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p
              class="text-3xl font-bold text-gray-900 dark:text-gray-100 font-heading">
              {{ animatedRate }}%
            </p>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ t("dashboard.success_rate") }}
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
        <h2
          class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Target class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {{ t("dashboard.general_progress") }}
        </h2>
        <div
          class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            class="bg-linear-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out relative"
            :style="{ width: `${animatedRate}%` }">
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {{
            t("dashboard.tasks_completed_of", {
              completed: completedCount,
              total: totalTasks,
            })
          }}
        </p>
      </div>

      <!-- Recent Tasks -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h2
            class="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ListTodo class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {{ t("dashboard.recent_tasks") }}
          </h2>
          <RouterLink
            to="/tasks"
            class="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors group">
            {{ t("dashboard.view_all") }}
            <ArrowRight
              class="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </RouterLink>
        </div>

        <div v-if="recentTasks.length > 0" class="space-y-3">
          <div
            v-for="task in recentTasks"
            :key="task.id"
            @click="toggleTaskCompletion(task.id)"
            class="group flex items-center gap-3 p-3 rounded-xl transition-all border cursor-pointer relative overflow-hidden"
            :class="[
              task.completed
                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30'
                : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md',
            ]">
            <div
              class="shrink-0 relative flex items-center justify-center w-8 h-8">
              <div
                class="w-5 h-5 rounded-full border-2 transition-colors duration-300"
                :class="
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-500'
                "></div>
              <CheckCircle2
                v-if="task.completed"
                class="absolute w-3.5 h-3.5 text-white" />
            </div>

            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'font-bold truncate',
                  task.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-800 dark:text-gray-100',
                ]">
                {{ task.title }}
              </p>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                <span v-if="task.projectName" class="flex items-center gap-1"
                  ><Folder class="w-3 h-3" /> {{ task.projectName }}</span
                >
                <span v-if="task.dueDate" class="flex items-center gap-1"
                  ><Clock class="w-3 h-3" />
                  {{ new Date(task.dueDate).toLocaleDateString() }}</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400 text-sm">
          <p>{{ t("dashboard.no_tasks") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
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
