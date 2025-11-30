<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { Home, CheckSquare, FolderKanban, Calendar, Tags, BarChart2, User } from 'lucide-vue-next';

const route = useRoute();

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
  <nav class="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/30 dark:border-gray-700/30 pb-safe z-50 md:hidden">
    <div class="flex justify-between items-center px-4 py-2 overflow-x-auto no-scrollbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group min-w-[60px]"
        :class="route.path === item.path ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'">
        
        <!-- Active Indicator -->
        <div 
          v-if="route.path === item.path"
          class="absolute -top-2 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.5)]">
        </div>

        <!-- Icons -->
        <component 
          :is="item.icon" 
          class="w-5 h-5 transition-transform duration-300 group-active:scale-90" 
          :class="route.path === item.path ? '-translate-y-0.5' : ''" 
        />
        
        <span class="text-[9px] font-medium truncate w-full text-center">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
