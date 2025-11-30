<script setup lang="ts">
import { ref } from "vue";
import { useTasks } from "../composables/useTask";
import { useTaskState } from "../composables/useTaskState";
import { Folder, Briefcase, Star, Heart, Zap, Coffee, Music, ChevronDown } from 'lucide-vue-next';

const newTask = ref("");
const selectedProjectId = ref<string | undefined>(undefined);
const isDropdownOpen = ref(false);

const { addTask } = useTasks();
const { projects } = useTaskState();

const iconMap: Record<string, any> = {
  Folder, Briefcase, Star, Heart, Zap, Coffee, Music
};

function handleSubmit() {
  const trimmed = newTask.value.trim();
  if (!trimmed) return;

  addTask(trimmed, selectedProjectId.value);
  newTask.value = "";
  selectedProjectId.value = undefined;
  isDropdownOpen.value = false;
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function selectProject(projectId: string | undefined) {
  selectedProjectId.value = projectId;
  isDropdownOpen.value = false;
}

function getSelectedProject() {
  return projects.value.find(p => p.id === selectedProjectId.value);
}

const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    pink: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400',
    rose: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    teal: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400',
    cyan: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return colors[color] || colors.indigo;
};
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="relative flex gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-2xl border border-gray-200/30 dark:border-gray-700/30">
    
    <!-- Project Selector -->
    <div class="relative">
      <button
        type="button"
        @click="toggleDropdown"
        class="h-full px-3 py-2.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 min-w-[140px]"
        :class="getSelectedProject() ? '' : 'text-gray-500 dark:text-gray-400'">
        <template v-if="getSelectedProject()">
          <div 
            class="p-1 rounded-md"
            :class="getColorClass(getSelectedProject()!.color)">
            <component :is="iconMap[getSelectedProject()!.icon] || Folder" class="w-4 h-4" />
          </div>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px]">
            {{ getSelectedProject()!.title }}
          </span>
        </template>
        <template v-else>
          <Folder class="w-4 h-4" />
          <span class="text-sm font-medium">Sin Proyecto</span>
        </template>
        <ChevronDown class="w-4 h-4 ml-auto opacity-50" />
      </button>

      <!-- Dropdown Menu -->
      <div 
        v-if="isDropdownOpen"
        class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50 animate-fade-in">
        <div class="p-2 space-y-1 max-h-60 overflow-y-auto">
          <button
            type="button"
            @click="selectProject(undefined)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
            <div class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500">
              <Folder class="w-4 h-4" />
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sin Proyecto</span>
            <div v-if="!selectedProjectId" class="ml-auto w-2 h-2 rounded-full bg-indigo-500"></div>
          </button>

          <button
            v-for="project in projects"
            :key="project.id"
            type="button"
            @click="selectProject(project.id)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
            <div 
              class="p-1.5 rounded-md"
              :class="getColorClass(project.color)">
              <component :is="iconMap[project.icon] || Folder" class="w-4 h-4" />
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ project.title }}</span>
            <div v-if="selectedProjectId === project.id" class="ml-auto w-2 h-2 rounded-full bg-indigo-500"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Input -->
    <input
      id="new-task"
      type="text"
      v-model="newTask"
      placeholder="¿Qué tienes que hacer hoy?"
      class="flex-1 bg-transparent border-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 text-lg" 
    />

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="!newTask.trim()"
      class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Backdrop for dropdown -->
    <div 
      v-if="isDropdownOpen" 
      class="fixed inset-0 z-40" 
      @click="isDropdownOpen = false">
    </div>
  </form>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
