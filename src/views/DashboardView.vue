<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTaskState } from '../composables/useTaskState';
import { useTasks } from '../composables/useTask';
import { RouterLink } from 'vue-router';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  ListTodo, 
  ArrowRight 
} from 'lucide-vue-next';

const { tasks, pendingTasks, completedTasks } = useTaskState();
const { loadTask } = useTasks();

onMounted(loadTask);

// Estadísticas
const totalTasks = computed(() => tasks.value.length);
const completedCount = computed(() => completedTasks.value.length);
const pendingCount = computed(() => pendingTasks.value.length);
const completionRate = computed(() => 
  totalTasks.value > 0 ? Math.round((completedCount.value / totalTasks.value) * 100) : 0
);

// Tareas recientes (últimas 5)
const recentTasks = computed(() => tasks.value.slice(0, 5));
</script>

<template>
  <div class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full animate-fade-in">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-heading">
        Panel Principal
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-lg">
        ¡Bienvenido de nuevo! Aquí tienes un resumen de tu productividad
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Tasks -->
      <div class="glass-card p-6 rounded-2xl flex flex-col justify-center group hover:-translate-y-1 transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tareas</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2 font-heading">{{ totalTasks }}</p>
          </div>
          <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <ListTodo class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      <!-- Completed -->
      <div class="glass-card p-6 rounded-2xl flex flex-col justify-center group hover:-translate-y-1 transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2 font-heading">{{ completedCount }}</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <!-- Pending -->
      <div class="glass-card p-6 rounded-2xl flex flex-col justify-center group hover:-translate-y-1 transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
            <p class="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-heading">{{ pendingCount }}</p>
          </div>
          <div class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Clock class="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      <!-- Completion Rate -->
      <div class="glass-card p-6 rounded-2xl flex flex-col justify-center group hover:-translate-y-1 transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Éxito</p>
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2 font-heading">{{ completionRate }}%</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Target class="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="glass-panel p-6 rounded-2xl mb-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 font-heading">Progreso General</h3>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div 
          class="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out relative"
          :style="{ width: `${completionRate}%` }">
          <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
        {{ completedCount }} de {{ totalTasks }} tareas completadas
      </p>
    </div>

    <!-- Recent Tasks -->
    <div class="glass-panel p-6 rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 font-heading">Tareas Recientes</h3>
        <RouterLink 
          to="/tasks"
          class="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors group">
          Ver Todas 
          <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </RouterLink>
      </div>
      
      <div v-if="recentTasks.length > 0" class="space-y-3">
        <div 
          v-for="task in recentTasks" 
          :key="task.id"
          class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50">
          <div class="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              :checked="task.completed"
              disabled
              class="peer w-5 h-5 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 rounded cursor-not-allowed appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600" />
            <CheckCircle2 v-if="task.completed" class="absolute w-3.5 h-3.5 text-white pointer-events-none" />
          </div>
          
          <span 
            :class="[
              'flex-1 font-medium truncate',
              task.completed 
                ? 'line-through text-gray-400 dark:text-gray-500' 
                : 'text-gray-900 dark:text-gray-100'
            ]">
            {{ task.title }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap">
            {{ new Date(task.createdAt).toLocaleDateString() }}
          </span>
        </div>
      </div>
      
      <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
        <div class="mb-4 bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
          <ListTodo class="w-8 h-8 text-indigo-500" />
        </div>
        <p class="text-lg font-medium mb-1">No hay tareas aún</p>
        <p class="text-sm mb-6">¡Comienza creando tu primera tarea!</p>
        <RouterLink 
          to="/tasks"
          class="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5">
          Ir a Tareas
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
