<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Folder, Briefcase, Star, Heart, Zap, Coffee, Music, Book, Camera, Bell, Gift, Globe, Home } from 'lucide-vue-next';
import type { Project } from '../types/global';

const props = defineProps<{
  isOpen: boolean;
  project?: Project | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', project: Project): void;
  (e: 'update', project: Project): void;
}>();

const title = ref('');
const description = ref('');
const selectedColor = ref('indigo');
const selectedIcon = ref('Folder');

// Define resetForm before using it in watch
const resetForm = () => {
  title.value = '';
  description.value = '';
  selectedColor.value = 'indigo';
  selectedIcon.value = 'Folder';
};

// Watch for project prop changes to populate form for editing
watch(() => props.project, (newProject) => {
  if (newProject) {
    title.value = newProject.title;
    description.value = newProject.description || '';
    selectedColor.value = newProject.color;
    selectedIcon.value = newProject.icon;
  } else {
    resetForm();
  }
}, { immediate: true });

// Watch for isOpen to reset form when closing (if not editing)
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    // Optional: reset on close?
  } else if (!props.project) {
    resetForm();
  }
});

const colors = [
  { name: 'indigo', class: 'bg-indigo-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'pink', class: 'bg-pink-500' },
  { name: 'rose', class: 'bg-rose-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'amber', class: 'bg-amber-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'teal', class: 'bg-teal-500' },
  { name: 'cyan', class: 'bg-cyan-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'lime', class: 'bg-lime-500' },
  { name: 'emerald', class: 'bg-emerald-500' },
  { name: 'fuchsia', class: 'bg-fuchsia-500' },
  { name: 'sky', class: 'bg-sky-500' },
  { name: 'violet', class: 'bg-violet-500' },
];

const icons = [
  { name: 'Folder', component: Folder },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'Zap', component: Zap },
  { name: 'Coffee', component: Coffee },
  { name: 'Music', component: Music },
  { name: 'Book', component: Book },
  { name: 'Camera', component: Camera },
  { name: 'Bell', component: Bell },
  { name: 'Gift', component: Gift },
  { name: 'Globe', component: Globe },
  { name: 'Home', component: Home },
];


const handleSubmit = () => {
  if (!title.value.trim()) return;

  if (props.project) {
    // Update existing project
    const updatedProject: Project = {
      ...props.project,
      title: title.value,
      description: description.value,
      color: selectedColor.value,
      icon: selectedIcon.value,
    };
    emit('update', updatedProject);
  } else {
    // Create new project
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: title.value,
      description: description.value,
      color: selectedColor.value,
      icon: selectedIcon.value,
      createdAt: new Date(),
    };
    emit('create', newProject);
  }
  
  if (!props.project) resetForm();
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
      @click="$emit('close')">
    </div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white font-heading">
          {{ project ? $t('projects.edit_project') : $t('projects.new_project') }}
        </h3>
        <button 
          @click="$emit('close')"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('projects.project_name') }}</label>
          <input 
            v-model="title"
            type="text" 
            :placeholder="$t('projects.project_name')"
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            autofocus
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('projects.description_optional') }}</label>
          <textarea 
            v-model="description"
            rows="2"
            :placeholder="$t('projects.description_placeholder')"
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Color Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ $t('projects.color') }}</label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="color in colors"
              :key="color.name"
              @click="selectedColor = color.name"
              class="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 dark:ring-offset-gray-900"
              :class="[
                color.class,
                selectedColor === color.name ? 'ring-gray-400 dark:ring-gray-500 scale-110' : 'ring-transparent'
              ]"
            ></button>
          </div>
        </div>

        <!-- Icon Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{{ $t('projects.icon') }}</label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="icon in icons"
              :key="icon.name"
              @click="selectedIcon = icon.name"
              class="p-2.5 rounded-xl transition-all border"
              :class="[
                selectedIcon === icon.name 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <component :is="icon.component" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
        <button 
          @click="$emit('close')"
          class="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
          {{ $t('common.cancel') }}
        </button>
        <button 
          @click="handleSubmit"
          :disabled="!title.trim()"
          class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30">
          {{ project ? $t('common.save') : $t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
