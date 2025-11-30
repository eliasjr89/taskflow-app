<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import type { Task } from "../types/global";
import { useConfetti } from "../composables/useConfetti";
import { useTaskState } from "../composables/useTaskState";
import { Folder, Briefcase, Star, Heart, Zap, Coffee, Music, Trash2 } from 'lucide-vue-next';

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: "toggle-complete", id: number): void;
  (e: "delete-task", id: number): void;
  (e: "edit-task", task: Task): void;
}>();

const { fireConfetti } = useConfetti();
const { projects } = useTaskState();

const isEditing = ref(false);
const editTitle = ref(props.task.title);
const titleInput = ref<HTMLInputElement | null>(null);

const iconMap: Record<string, any> = {
  Folder, Briefcase, Star, Heart, Zap, Coffee, Music
};

const project = computed(() => {
  return props.task.projectId ? projects.value.find(p => p.id === props.task.projectId) : null;
});

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

function onToggle() {
  emit('toggle-complete', props.task.id);
  if (!props.task.completed) {
    fireConfetti();
  }
}

function onDelete() {
  emit('delete-task', props.task.id);
}

function startEditing() {
  if (props.task.completed) return;
  isEditing.value = true;
  editTitle.value = props.task.title;
  nextTick(() => {
    titleInput.value?.focus();
  });
}

function saveEdit() {
  if (!isEditing.value) return;
  if (editTitle.value.trim()) {
    emit('edit-task', { ...props.task, title: editTitle.value });
  } else {
    editTitle.value = props.task.title;
  }
  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editTitle.value = props.task.title;
}
</script>

<template>
  <div
    class="group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 glass-card hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50"
    :class="{ 'opacity-60': task.completed }">
    
    <div class="flex items-center gap-5 flex-1 min-w-0">
      <div class="relative flex-shrink-0">
        <input
          type="checkbox"
          :checked="task.completed"
          @change="onToggle"
          class="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-indigo-500 transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
        />
        <svg
          class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="14"
          height="14">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <div v-if="isEditing" class="flex items-center gap-2">
          <input
            ref="titleInput"
            v-model="editTitle"
            @blur="saveEdit"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            type="text"
            class="w-full bg-transparent border-b-2 border-indigo-500 focus:outline-none text-gray-800 dark:text-gray-100 px-1 py-0.5 text-lg"
          />
        </div>
        <h3
          v-else
          @dblclick="startEditing"
          class="text-lg font-medium truncate transition-all duration-300 cursor-text select-none"
          :class="[
            task.completed
              ? 'text-gray-400 dark:text-gray-500 line-through decoration-2 decoration-indigo-500/30'
              : 'text-gray-800 dark:text-gray-100'
          ]">
          {{ task.title }}
        </h3>
        
        <div class="flex items-center gap-3 mt-1.5">
          <!-- Project Tag -->
          <div 
            v-if="project"
            class="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium transition-colors"
            :class="getColorClass(project.color)">
            <component :is="iconMap[project.icon] || Folder" class="w-3 h-3" />
            <span class="truncate max-w-[100px]">{{ project.title }}</span>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {{ new Date(task.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) }}
          </p>
        </div>
      </div>
    </div>

    <button
      @click="onDelete"
      class="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ml-4"
      aria-label="Eliminar tarea">
      <Trash2 class="w-5 h-5" />
    </button>
  </div>
</template>
