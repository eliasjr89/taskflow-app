<script setup lang="ts">
import { ref, watch } from "vue";
import type { Task } from "@/types/global";
import draggable from "vuedraggable";
import TaskCard from "./TaskCard.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
const activeTab = ref<"pending" | "completed">("pending");

// Watch prompt tasks change
watch(
  () => props.tasks,
  (newTasks) => {
    pendingTasks.value = newTasks.filter((t) => !t.completed);
    completedTasks.value = newTasks.filter((t) => t.completed);
  },
  { immediate: true, deep: true },
);

const onChange = (evt: any, isCompletedColumn: boolean) => {
  if (evt.added) {
    const task = evt.added.element as Task;
    emit("update:status", task.id, isCompletedColumn);
  }
};

const handleSelectTask = (task: Task) => {
  emit("select-task", task);
};
</script>

<template>
  <div class="flex flex-col md:min-h-full">
    <!-- Mobile Tabs -->
    <div
      class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 md:hidden shrink-0">
      <button
        @click="activeTab = 'pending'"
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer"
        :class="
          activeTab === 'pending'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400'
            : 'text-gray-500 dark:text-gray-400'
        ">
        {{ t("tasks.kanban_pending") }} ({{ pendingTasks.length }})
      </button>
      <button
        @click="activeTab = 'completed'"
        class="flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer"
        :class="
          activeTab === 'completed'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400'
        ">
        {{ t("tasks.kanban_completed") }} ({{ completedTasks.length }})
      </button>
    </div>

    <!-- Columns Container -->
    <div class="flex flex-col md:flex-row gap-0 pb-4">
      <!-- Pending Column -->
      <div
        class="flex-1 flex-col w-full md:min-w-[300px] md:px-6"
        :class="activeTab === 'pending' ? 'flex' : 'hidden md:flex'">
        <div
          class="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <h3
            class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            {{ t("tasks.kanban_pending") }}
          </h3>
          <span
            class="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
            {{ pendingTasks.length }}
          </span>
        </div>

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
                @toggle-complete="
                  () => emit('update:status', element.id, true)
                " />
            </div>
          </template>
        </draggable>
      </div>

      <!-- Vertical Divider -->
      <div
        class="hidden md:block w-px bg-gray-100 dark:bg-gray-800/50 self-stretch my-4"></div>

      <!-- Completed Column -->
      <div
        class="flex-1 flex-col w-full md:min-w-[300px] md:px-6"
        :class="activeTab === 'completed' ? 'flex' : 'hidden md:flex'">
        <div
          class="flex items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <h3
            class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            {{ t("tasks.kanban_completed") }}
          </h3>
          <span
            class="bg-white dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
            {{ completedTasks.length }}
          </span>
        </div>

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
                @toggle-complete="
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
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
