<script setup lang="ts">
import { computed } from "vue";
import { useTaskState } from "../composables/useTaskState";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  FolderKanban,
  BarChart2,
  Zap,
  Trophy,
} from "lucide-vue-next";
// ... rest imports ...

// ... (existing computed vars)

const { tasks, projects, loadData } = useTaskState();

// Racha actual (Tasks completed in last 7 days)
const currentStreak = computed(() => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return tasks.value.filter((t) => {
    return t.completed && new Date(t.createdAt) >= sevenDaysAgo;
  }).length;
});

// Proyecto más productivo
const mostProductiveProject = computed(() => {
  if (projects.value.length === 0) return null;

  const projectStats = projects.value.map((project) => {
    const projectTasks = tasks.value.filter((t) => t.projectId === project.id);
    const completed = projectTasks.filter((t) => t.completed).length;
    return {
      project,
      completedTasks: completed,
      totalTasks: projectTasks.length,
    };
  });

  return projectStats.sort((a, b) => b.completedTasks - a.completedTasks)[0];
});

const animatedStreak = useAnimatedNumber(currentStreak);

import { useI18n } from "vue-i18n";

import CountUp from "../components/CountUp.vue";
import { useAnimatedNumber } from "../composables/useAnimatedNumber";
import { ref, onMounted } from "vue";

const { t } = useI18n();

const isMounted = ref(false);

onMounted(() => {
  loadData();
  setTimeout(() => {
    isMounted.value = true;
  }, 100);
});

// Estadísticas generales
const totalTasks = computed(() => tasks.value.length);
const completedTasks = computed(
  () => tasks.value.filter((t) => t.completed).length
);
const pendingTasks = computed(
  () => tasks.value.filter((t) => !t.completed).length
);
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});

// Animated Stats
const animatedTotal = useAnimatedNumber(totalTasks);
const animatedCompleted = useAnimatedNumber(completedTasks);
const animatedPending = useAnimatedNumber(pendingTasks);
const animatedRate = useAnimatedNumber(completionRate);

// Tareas por proyecto
const tasksByProject = computed(() => {
  return projects.value
    .map((project) => {
      const projectTasks = tasks.value.filter(
        (t) => t.projectId === project.id
      );
      const completed = projectTasks.filter((t) => t.completed).length;
      const percentage =
        projectTasks.length > 0
          ? Math.round((completed / projectTasks.length) * 100)
          : 0;

      return {
        project,
        total: projectTasks.length,
        completed,
        pending: projectTasks.length - completed,
        percentage,
      };
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.percentage - a.percentage);
});

// Tareas sin proyecto
const tasksWithoutProject = computed(() => {
  const without = tasks.value.filter((t) => !t.projectId);
  const completed = without.filter((t) => t.completed).length;
  return {
    total: without.length,
    completed,
    pending: without.length - completed,
    percentage:
      without.length > 0 ? Math.round((completed / without.length) * 100) : 0,
  };
});

// Actividad semanal (últimos 7 días)
const weeklyActivity = computed(() => {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayTasks = tasks.value.filter((t) => {
      const taskDate = new Date(t.createdAt);
      return taskDate >= date && taskDate < nextDate;
    });

    days.push({
      day: date.toLocaleDateString("es-ES", { weekday: "short" }),
      date: date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      }),
      created: dayTasks.length,
      completed: dayTasks.filter((t) => t.completed).length,
    });
  }

  return days;
});

const maxDailyTasks = computed(() => {
  return Math.max(...weeklyActivity.value.map((d) => d.created), 1);
});
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8 animate-fade-in">
    <!-- Header -->
    <div class="mb-8 text-center md:text-left">
      <h1
        class="text-3xl md:text-4xl font-bold font-heading mb-2 flex items-center justify-center md:justify-start gap-2">
        📊
        <span
          class="bg-linear-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
          >{{ t("analytics.title") }}</span
        >
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t("analytics.subtitle") }}
      </p>
    </div>

    <div class="space-y-6">
      <!-- Highlights Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Current Streak -->
        <div
          class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div
            class="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap class="w-24 h-24 text-orange-500" />
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Zap class="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                {{ t("profile.streak") || "Racha Actual (7 días)" }}
              </h3>
            </div>
            <div class="flex items-end gap-2">
              <span
                class="text-4xl font-bold text-gray-900 dark:text-gray-100"
                >{{ animatedStreak }}</span
              >
              <span class="text-sm text-gray-600 dark:text-gray-400 mb-1"
                >tareas completadas</span
              >
            </div>
          </div>
        </div>

        <!-- Top Project -->
        <div
          class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div
            class="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy class="w-24 h-24 text-yellow-500" />
          </div>
          <template v-if="mostProductiveProject">
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Trophy
                    class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                  {{
                    t("profile.most_productive") || "Proyecto Más Productivo"
                  }}
                </h3>
              </div>
              <div class="mt-2">
                <p
                  class="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {{ mostProductiveProject.project.title }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ mostProductiveProject.completedTasks }}/{{
                      mostProductiveProject.totalTasks
                    }}
                    completadas
                  </div>
                  <div
                    class="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                    {{
                      Math.round(
                        (mostProductiveProject.completedTasks /
                          mostProductiveProject.totalTasks) *
                          100
                      )
                    }}%
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              class="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <p class="text-gray-500 dark:text-gray-400">
                Sin datos suficientes
              </p>
            </div>
          </template>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Target class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {{ t("analytics.total_tasks") }}
          </p>
          <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ animatedTotal }}
          </p>
        </div>

        <div
          class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle2
                class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {{ t("analytics.completed_tasks") }}
          </p>
          <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ animatedCompleted }}
          </p>
        </div>

        <div
          class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Clock class="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {{ t("analytics.pending_tasks") }}
          </p>
          <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ animatedPending }}
          </p>
        </div>

        <div
          class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
          <div class="flex items-center justify-between mb-3">
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <TrendingUp
                class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {{ t("analytics.completion_rate") }}
          </p>
          <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ animatedRate }}%
          </p>
        </div>
      </div>

      <!-- Progress Ring -->
      <div class="glass-card rounded-2xl p-8">
        <h3
          class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <BarChart2 class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {{ t("analytics.general_progress") }}
        </h3>
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- Progress Circle -->
          <div class="relative w-48 h-48">
            <svg class="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
              <!-- Background circle -->
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                stroke-width="16"
                class="text-gray-200 dark:text-gray-700" />
              <!-- Progress circle -->
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#gradient)"
                stroke-width="16"
                stroke-linecap="round"
                :stroke-dasharray="`${(animatedRate * 534.07) / 100} 534.07`"
                class="transition-all duration-1000 ease-out" />
              <!-- Gradient definition -->
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {{ animatedRate }}%
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t("analytics.completed_tasks") }}
              </p>
            </div>
          </div>

          <!-- Stats breakdown -->
          <div class="flex-1 w-full">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-gray-700 dark:text-gray-300">{{
                    t("analytics.completed_tasks")
                  }}</span>
                </div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">{{
                  animatedCompleted
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span class="text-gray-700 dark:text-gray-300">{{
                    t("analytics.pending_tasks")
                  }}</span>
                </div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">{{
                  animatedPending
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span class="text-gray-700 dark:text-gray-300">{{
                    t("analytics.total")
                  }}</span>
                </div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">{{
                  animatedTotal
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Distribution -->
      <div class="glass-card rounded-2xl p-8">
        <h3
          class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <FolderKanban class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {{ t("analytics.tasks_by_project") }}
        </h3>
        <div class="space-y-4">
          <div
            v-for="item in tasksByProject"
            :key="item.project.id"
            class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="`bg-${item.project.color}-500`"></div>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{
                  item.project.title
                }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ item.completed }}/{{ item.total }}
                </span>
                <span
                  class="text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-12 text-right">
                  <CountUp :to="item.percentage" />%
                </span>
              </div>
            </div>
            <div
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-1000 ease-out"
                :class="`bg-${item.project.color}-500`"
                :style="{
                  width: isMounted ? `${item.percentage}%` : '0%',
                }"></div>
            </div>
          </div>

          <!-- Tasks without project -->
          <div
            v-if="tasksWithoutProject.total > 0"
            class="space-y-2 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{
                  t("analytics.without_project")
                }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ tasksWithoutProject.completed }}/{{
                    tasksWithoutProject.total
                  }}
                </span>
                <span
                  class="text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-12 text-right">
                  <CountUp :to="tasksWithoutProject.percentage" />%
                </span>
              </div>
            </div>
            <div
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gray-400 rounded-full transition-all duration-1000 ease-out"
                :style="{
                  width: isMounted
                    ? `${tasksWithoutProject.percentage}%`
                    : '0%',
                }"></div>
            </div>
          </div>

          <div
            v-if="
              tasksByProject.length === 0 && tasksWithoutProject.total === 0
            "
            class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ t("analytics.no_tasks_to_analyze") }}
          </div>
        </div>
      </div>

      <!-- Weekly Activity -->
      <div class="glass-card rounded-2xl p-8">
        <h3
          class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {{ t("analytics.weekly_activity") }}
        </h3>
        <div class="grid grid-cols-7 gap-3">
          <div
            v-for="day in weeklyActivity"
            :key="day.date"
            class="flex flex-col items-center">
            <div
              class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              {{ day.day }}
            </div>
            <div
              class="w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-32 flex flex-col-reverse p-1">
              <div
                v-if="day.created > 0"
                class="w-full bg-linear-to-t from-indigo-500 to-purple-500 rounded transition-all duration-1000 ease-out"
                :style="{
                  height: isMounted
                    ? `${(day.created / maxDailyTasks) * 100}%`
                    : '0%',
                }"></div>
            </div>
            <div
              class="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-2">
              {{ day.created }}
            </div>
            <div class="text-[10px] text-gray-500 dark:text-gray-400">
              {{ day.date }}
            </div>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-center gap-4 text-sm">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded bg-linear-to-t from-indigo-500 to-purple-500"></div>
            <span class="text-gray-600 dark:text-gray-400">{{
              t("analytics.created_tasks")
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
