<script setup lang="ts">
import { computed } from 'vue';
import { useTaskState } from '../composables/useTaskState';
import { useTheme } from '../composables/usThemes';
import { useI18n } from 'vue-i18n';
import { User, CheckCircle2, Target, TrendingUp, Zap, Moon, Sun } from 'lucide-vue-next';

import CountUp from '../components/CountUp.vue';

const { tasks, projects } = useTaskState();
const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();

// Estadísticas del usuario
const totalTasks = computed(() => tasks.value.length);
const completedTasks = computed(() => tasks.value.filter(t => t.completed).length);
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});

const totalProjects = computed(() => projects.value.length);

// Racha de tareas completadas (placeholder - calculado por días consecutivos)
const currentStreak = computed(() => {
  // Simplificado: contar tareas completadas en los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return tasks.value.filter(t => {
    return t.completed && new Date(t.createdAt) >= sevenDaysAgo;
  }).length;
});

// Proyecto más productivo
const mostProductiveProject = computed(() => {
  if (projects.value.length === 0) return null;
  
  const projectStats = projects.value.map(project => {
    const projectTasks = tasks.value.filter(t => t.projectId === project.id);
    const completed = projectTasks.filter(t => t.completed).length;
    return {
      project,
      completedTasks: completed,
      totalTasks: projectTasks.length
    };
  });
  
  return projectStats.sort((a, b) => b.completedTasks - a.completedTasks)[0];
});

const stats = computed(() => [
  {
    label: t('profile.total_tasks'),
    value: totalTasks.value,
    icon: Target,
    color: 'indigo',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    label: t('profile.completed_tasks'),
    value: completedTasks.value,
    icon: CheckCircle2,
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400'
  },
  {
    label: t('profile.completion_rate'),
    value: completionRate.value,
    suffix: '%',
    icon: TrendingUp,
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    label: t('profile.streak'),
    value: currentStreak.value,
    icon: Zap,
    color: 'orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-600 dark:text-orange-400'
  }
]);
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8 animate-fade-in">
    <!-- Header -->
    <div class="mb-8 text-center md:text-left">
      <h1 class="text-3xl md:text-4xl font-bold font-heading mb-2 flex items-center justify-center md:justify-start gap-2">
        <span>👤</span>
        <span class="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{{ t('profile.title') }}</span>
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('profile.subtitle') }}
      </p>
    </div>

    <div class="space-y-6">
      <!-- Profile Card -->
      <div class="glass-card rounded-2xl p-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <User class="w-12 h-12 text-white" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
              <CheckCircle2 class="w-4 h-4 text-white" />
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {{ t('profile.demo_user') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ t('nav.subtitle') }}
            </p>
            <div class="flex flex-wrap gap-2 justify-center md:justify-start">
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {{ totalProjects }} {{ t('nav.projects') }}
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                {{ completedTasks }} {{ t('profile.completed_tasks') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span>📊</span>
          <span class="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{{ t('analytics.title') }}</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
            <div class="flex items-start justify-between mb-3">
              <div :class="[stat.bgColor, 'p-3 rounded-xl']">
                <component :is="stat.icon" :class="[stat.textColor, 'w-6 h-6']" />
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {{ stat.label }}
            </p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              <CountUp :to="stat.value" />{{ stat.suffix || '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Most Productive Project -->
      <div v-if="mostProductiveProject && mostProductiveProject.project" class="glass-card rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-green-600 dark:text-green-400" />
          {{ t('profile.most_productive') }}
        </h3>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle2 class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-900 dark:text-gray-100">
              {{ mostProductiveProject.project.title }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('dashboard.tasks_completed_of', { completed: mostProductiveProject.completedTasks, total: mostProductiveProject.totalTasks }) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ mostProductiveProject.totalTasks > 0 
                ? Math.round((mostProductiveProject.completedTasks / mostProductiveProject.totalTasks) * 100) 
                : 0 }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="glass-card rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          ⚙️ Preferencias
        </h3>
        
        <div class="space-y-4">
          <!-- Theme Toggle -->
          <div class="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <component :is="isDark ? Moon : Sun" class="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  {{ t('profile.theme') }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ isDark ? t('profile.dark_mode') : t('profile.light_mode') }}
                </p>
              </div>
            </div>
            <button
              @click="toggleTheme"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
              :class="isDark ? 'bg-indigo-600' : 'bg-gray-300'">
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                :class="isDark ? 'translate-x-7' : 'translate-x-1'">
              </span>
            </button>
          </div>

          <!-- Placeholder Settings -->
          <div class="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 opacity-60">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Zap class="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {{ t('profile.notifications') }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('profile.coming_soon') }}
                  </p>
                </div>
              </div>
              <div class="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {{ t('profile.coming_soon') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
