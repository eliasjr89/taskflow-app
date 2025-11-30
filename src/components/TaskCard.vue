<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import type { Task } from "../types/global";
import { useTasks } from "../composables/useTask";

const { task } = defineProps<{ task: Task }>();
const { removeTask, toggleTaskCompletion, updateTask } = useTasks();

const isEditing = ref(false);
const editableTitle = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const formattedDate = computed(() => task.createdAt.toLocaleString());

function editTask() {
  editableTitle.value = task.title;
  isEditing.value = true;
}

function saveEditedTask() {
  const trimmed = editableTitle.value.trim();
  if (trimmed.length === 0) {
    editableTitle.value = task.title;
    isEditing.value = false;
    return;
  }
  updateTask(task.id, { title: trimmed });
  isEditing.value = false;
}

function cancelEdition() {
  editableTitle.value = task.title;
  isEditing.value = false;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") saveEditedTask();
  if (e.key === "Escape") cancelEdition();
}

watch(isEditing, async (editing) => {
  if (editing) {
    await nextTick();
    inputRef.value?.focus();
    const el = inputRef.value;
    if (el) el.setSelectionRange(el.value.length, el.value.length);
  }
});
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-md p-5 flex items-center justify-between gap-4 hover:shadow-lg transition-all duration-300 border border-gray-200/30 dark:border-gray-700/30">
    <div class="flex items-center gap-4 flex-1">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="() => toggleTaskCompletion(task.id)"
        class="w-5 h-5 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer transition-all" />
      <div class="flex-1">
        <h3
          v-if="!isEditing"
          @dblclick="editTask"
          :class="{
            'line-through text-gray-400 dark:text-gray-500': task.completed,
            'text-gray-900 dark:text-gray-100 font-medium': !task.completed,
          }"
          class="cursor-text select-none text-base">
          {{ task.title }}
        </h3>
        <input
          v-else
          ref="inputRef"
          v-model="editableTitle"
          @blur="saveEditedTask"
          @keydown="handleKeydown"
          class="border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
        <p class="text-xs mt-1.5 text-gray-500 dark:text-gray-400">
          {{ formattedDate }}
        </p>
      </div>
    </div>
    <button
      @click="() => removeTask(task.id)"
      class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>
