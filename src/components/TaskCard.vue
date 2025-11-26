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
    if (el) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }
});
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded shadow p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-colors duration-300">
    <div class="flex items-center gap-3">
      <!-- Checkbox -->
      <input
        type="checkbox"
        :checked="task.completed"
        @change="() => toggleTaskCompletion(task.id)"
        class="w-5 h-5 text-blue-500 dark:text-blue-400 border-gray-300 dark:border-gray-600 focus:ring-blue-400" />

      <div>
        <!-- Título editable -->
        <h3
          v-if="!isEditing"
          @dblclick="editTask"
          :class="{
            'line-through text-gray-400 dark:text-gray-500': task.completed,
            'text-gray-900 dark:text-gray-100': !task.completed,
          }"
          class="cursor-text select-none">
          {{ task.title }}
        </h3>

        <input
          v-else
          ref="inputRef"
          v-model="editableTitle"
          @blur="saveEditedTask"
          @keydown="handleKeydown"
          class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />

        <p class="text-xs mt-1 text-gray-500 dark:text-gray-400">
          Created: {{ formattedDate }}
        </p>
      </div>
    </div>

    <!-- Botón eliminar -->
    <button
      @click="() => removeTask(task.id)"
      class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 transition-colors cursor-pointer">
      Delete
    </button>
  </div>
</template>
