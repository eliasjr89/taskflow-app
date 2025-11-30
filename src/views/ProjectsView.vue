<script setup lang="ts">
import { ref } from 'vue';
import { useTaskState } from '../composables/useTaskState';
import { Plus, Folder, Briefcase, Star, Heart, Zap, Coffee, Music, Trash2 } from 'lucide-vue-next';
import AddProjectModal from '../components/AddProjectModal.vue';
import type { Project } from '../types/global';

const { projects, addProject, deleteProject, getProjectProgress } = useTaskState();
const isModalOpen = ref(false);

const iconMap: Record<string, any> = {
  Folder, Briefcase, Star, Heart, Zap, Coffee, Music
};

const handleCreateProject = (project: Project) => {
  addProject(project);
  isModalOpen.value = false;
};

const handleDeleteProject = (id: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
    deleteProject(id);
  }
};

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

const getProgressColor = (color: string) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
  };
  return colors[color] || 'bg-indigo-500';
};
</script>

<template>
  <div class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-heading">
          Proyectos
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Organiza y gestiona tus grandes objetivos
        </p>
      </div>
      
      <button 
        @click="isModalOpen = true"
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5">
        <Plus class="w-5 h-5" />
        Nuevo Proyecto
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="glass-card p-6 rounded-2xl group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        
        <!-- Background Gradient Blob -->
        <div 
          class="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-all group-hover:scale-150"
          :class="getProgressColor(project.color)">
        </div>

        <!-- Card Header -->
        <div class="flex items-start justify-between mb-4 relative z-10">
          <div 
            class="p-3 rounded-xl transition-transform group-hover:scale-110 duration-300"
            :class="getColorClass(project.color)">
            <component :is="iconMap[project.icon] || Folder" class="w-6 h-6" />
          </div>
          
          <button 
            @click="handleDeleteProject(project.id)"
            class="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>

        <!-- Card Content -->
        <div class="mb-6 relative z-10">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1 font-heading">{{ project.title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em]">
            {{ project.description || 'Sin descripción' }}
          </p>
        </div>

        <!-- Progress -->
        <div class="relative z-10">
          <div class="flex justify-between text-sm mb-2">
            <span class="font-medium text-gray-600 dark:text-gray-300">Progreso</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ getProjectProgress(project.id) }}%</span>
          </div>
          <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              class="h-2.5 rounded-full transition-all duration-1000 ease-out"
              :class="getProgressColor(project.color)"
              :style="{ width: `${getProjectProgress(project.id)}%` }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-gray-200 dark:border-gray-700">
      <div class="mb-6 bg-indigo-50 dark:bg-indigo-900/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-bounce-slow">
        <Folder class="w-10 h-10 text-indigo-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">No hay proyectos aún</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Crea tu primer proyecto para organizar tus tareas de manera más eficiente y visual.
      </p>
      <button 
        @click="isModalOpen = true"
        class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5">
        Crear Primer Proyecto
      </button>
    </div>

    <!-- Modal -->
    <AddProjectModal 
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @create="handleCreateProject"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(5%); }
}
</style>
