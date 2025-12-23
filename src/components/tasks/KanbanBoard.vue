<script setup lang="ts">
import { ref, watch } from "vue";
import type { Task } from "@/types/global";
import draggable from "vuedraggable";
import TaskCard from "./TaskCard.vue";

const props = defineProps<{
  tasks: Task[];
  disableDrag?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:status", taskId: number, newStatus: boolean): void;
  (e: "select-task", task: Task): void;
  (e: "focus-task", task: Task): void;
}>();

// Internal state for columns to allow immediate UI update while dragging
const pendingTasks = ref<Task[]>([]);
const completedTasks = ref<Task[]>([]);

// Watch prompt tasks change to re-distribute (e.g. initial load or external filter change)
watch(
  () => props.tasks,
  (newTasks) => {
    pendingTasks.value = newTasks.filter((t) => !t.completed);
    completedTasks.value = newTasks.filter((t) => t.completed);
  },
  { immediate: true, deep: true }
);

const onChange = (evt: any, isCompletedColumn: boolean) => {
  if (evt.added) {
    const task = evt.added.element as Task;
    // Emit event to parent to sync with backend
    emit("update:status", task.id, isCompletedColumn);
  }
};

const handleSelectTask = (task: Task) => {
  emit("select-task", task);
};
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 h-full overflow-x-auto pb-4">
    <!-- Pending Column -->
    <div class="flex-1 min-w-[300px] flex flex-col h-full">
      <div
        class="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3
          class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500"></span>
          Pendiente
        </h3>
        <span
          class="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
          {{ pendingTasks.length }}
        </span>
      </div>

      <div
        class="flex-1 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-2 overflow-y-auto custom-scrollbar">
        <draggable
          v-model="pendingTasks"
          group="tasks"
          item-key="id"
          @change="onChange($event, false)"
          class="flex flex-col gap-3 min-h-[200px]"
          ghost-class="ghost-card"
          drag-class="drag-card"
          :disabled="disableDrag">
          <template #item="{ element }">
            <div class="cursor-grab active:cursor-grabbing">
              <TaskCard
                :task="element"
                :compact="true"
                @click="handleSelectTask(element)"
                @focus-task="emit('focus-task', $event)"
                @toggle-completion="
                  () => emit('update:status', element.id, true)
                " />
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Completed Column -->
    <div class="flex-1 min-w-[300px] flex flex-col h-full">
      <div
        class="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h3
          class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          Completado
        </h3>
        <span
          class="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
          {{ completedTasks.length }}
        </span>
      </div>

      <div
        class="flex-1 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-2 overflow-y-auto custom-scrollbar">
        <draggable
          v-model="completedTasks"
          group="tasks"
          item-key="id"
          @change="onChange($event, true)"
          class="flex flex-col gap-3 min-h-[200px]"
          ghost-class="ghost-card"
          drag-class="drag-card"
          :disabled="disableDrag">
          <template #item="{ element }">
            <div
              class="cursor-grab active:cursor-grabbing opacity-75 hover:opacity-100 transition-opacity">
              <TaskCard
                :task="element"
                :compact="true"
                @click="handleSelectTask(element)"
                @focus-task="emit('focus-task', $event)"
                @toggle-completion="
                  () => emit('update:status', element.id, false)
                " />
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
