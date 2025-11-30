<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { 
  Home, 
  CheckSquare, 
  FolderKanban, 
  Calendar, 
  Tags, 
  BarChart2, 
  User, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next';

const route = useRoute();
const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navItems = [
  { name: 'Inicio', path: '/', icon: Home },
  { name: 'Tareas', path: '/tasks', icon: CheckSquare },
  { name: 'Proyectos', path: '/projects', icon: FolderKanban },
  { name: 'Calendario', path: '/calendar', icon: Calendar },
  { name: 'Etiquetas', path: '/tags', icon: Tags },
  { name: 'Estadísticas', path: '/analytics', icon: BarChart2 },
  { name: 'Perfil', path: '/profile', icon: User },
];
</script>

<template>
  <aside
    class="hidden md:flex flex-col  glass-panel rounded-2xl gap-4 transition-all duration-300 h-[calc(100vh-6rem)] sticky top-10"
    :class="[isCollapsed ? 'w-15' : 'w-40']">
    
    <!-- Header with Toggle -->
    <div class="flex items-center justify-between mb-2 pb-4 border-b border-gray-200/30 dark:border-gray-700/30 relative">
      <div 
        class="flex flex-col overflow-hidden transition-all duration-300"
        :class="[isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto']">
        <h2 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-heading whitespace-nowrap">
          Menú
        </h2>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 whitespace-nowrap">Gestión de Productividad</p>
      </div>
      
      <button 
        @click="toggleSidebar"
        class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors absolute right-0 top-0"
        :class="{ 'right-1/2 translate-x-1/2': isCollapsed }">
        <component :is="isCollapsed ? ChevronRight : ChevronLeft" class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="flex flex-col gap-4 flex-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium relative group overflow-hidden"
        :class="[
          route.path === item.path
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
        ]">
        
        <component :is="item.icon" class="w-5 h-5 min-w-[20px]" />
        
        <span 
          class="transition-all duration-300 whitespace-nowrap"
          :class="[isCollapsed ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 w-auto translate-x-0']">
          {{ item.name }}
        </span>

        <!-- Tooltip for collapsed state -->
        <div 
          v-if="isCollapsed"
          class="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {{ item.name }}
        </div>
      </RouterLink>
    </nav>
  </aside>
</template>
