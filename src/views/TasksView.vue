<script setup lang="ts">
import { onMounted, ref } from "vue";

import { useTasks } from "../composables/useTask";
import { useProjectStore } from "../stores/projects";
import { storeToRefs } from "pinia";
import { useTaskFilter } from "@/composables/useTaskFilter";
import SkeletonLoader from "@/components/common/SkeletonLoader.vue";

import TaskDetailModal from "@/components/tasks/TaskDetailModal.vue";
import KanbanBoard from "@/components/tasks/KanbanBoard.vue";
import TaskTable from "@/components/tasks/TaskTable.vue";
import TaskMatrix from "@/components/tasks/TaskMatrix.vue";
import TaskTimeline from "@/components/tasks/TaskTimeline.vue";
import FocusMode from "@/components/tasks/FocusMode.vue";
import TasksToolbar from "@/components/tasks/TasksToolbar.vue";

const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);
const loadProjects = projectStore.fetchProjects;
const { t, locale } = useI18n();
import { useI18n } from "vue-i18n";

const { filteredTasks } = useTaskFilter();

const { tasks, loadTask, toggleTaskCompletion } = useTasks();

// View Mode State
const viewMode = ref<"board" | "table" | "matrix" | "timeline">("board");
const handleTaskStatusChange = async (
  taskId: number,
  newCompletionStatus: boolean,
) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task && task.completed !== newCompletionStatus) {
    await toggleTaskCompletion(taskId);
  }
};

const isModalOpen = ref(false);
const isFocusModeOpen = ref(false);
const selectedTask = ref<(typeof tasks.value)[0] | null>(null);
const isLoading = ref(true);

const handleOpenFocusMode = (task: (typeof tasks.value)[0]) => {
  selectedTask.value = task;
  isFocusModeOpen.value = true;
};

const handleCompleteTask = async (task: (typeof tasks.value)[0]) => {
  if (!task.completed) {
    await toggleTaskCompletion(task.id);
  }
};

const handleExportCSV = () => {
  const headers = [
    t("common.id"),
    t("tasks.task_title"),
    t("tasks.status"),
    t("tasks.priority"),
    t("tasks.project"),
    t("tasks.due_date"),
  ];
  const rows = filteredTasks.value.map((taskItem) => [
    taskItem.id,
    `"${taskItem.title.replace(/"/g, '""')}"`,
    taskItem.completed ? t("tasks.completed") : t("tasks.pending_title"),
    taskItem.priority ? t(`tasks.${taskItem.priority}`) : t("common.none"),
    `"${(
      projects.value.find((p) => p.id === taskItem.projectId)?.title ||
      t("projects.uncategorized")
    ).replace(/"/g, '""')}"`,
    taskItem.dueDate
      ? new Date(taskItem.dueDate).toLocaleDateString(
          locale.value === "es" ? "es-ES" : "en-US",
        )
      : t("common.na"),
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tasks_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

onMounted(async () => {
  try {
    await Promise.all([loadTask(), loadProjects()]);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
});

// Event Handlers
function handleSelectTask(task: (typeof tasks.value)[0]) {
  selectedTask.value = task;
  isModalOpen.value = true;
}
</script>

<template>
  <div class="flex flex-1 flex-col md:flex-row gap-6 animate-fade-in relative">
    <div class="flex-1 flex flex-col w-full px-4 md:px-0 lg:px-0">
      <!-- SKELETON LOADING -->
      <div v-if="isLoading" class="space-y-6">
        <SkeletonLoader type="text" />
        <SkeletonLoader type="list" :count="5" />
      </div>

      <!-- MAIN CONTENT -->
      <div v-else class="flex flex-col">
        <!-- Header Controls Panel -->
        <TasksToolbar
          v-model:viewMode="viewMode"
          @export="handleExportCSV"
          @add="
            isModalOpen = true;
            selectedTask = null;
          " />

        <!-- CONTENT AREA -->
        <div class="flex-1 min-h-0 relative">
          <!-- KANBAN VIEW -->
          <Transition name="fade" mode="out-in">
            <div v-if="viewMode === 'board'" class="h-full pb-4" :key="'board'">
              <KanbanBoard
                :tasks="filteredTasks"
                @update:status="handleTaskStatusChange"
                @select-task="handleSelectTask"
                @focus-task="handleOpenFocusMode" />
            </div>

            <!-- TABLE VIEW -->
            <div
              v-else-if="viewMode === 'table'"
              class="h-full pb-4 px-1"
              :key="'table'">
              <TaskTable
                :tasks="filteredTasks"
                :projects="projects"
                @select-task="handleSelectTask"
                @focus-task="handleOpenFocusMode"
                @update:status="handleTaskStatusChange" />
            </div>

            <!-- MATRIX VIEW -->
            <div
              v-else-if="viewMode === 'matrix'"
              class="h-full pb-4 px-1"
              :key="'matrix'">
              <TaskMatrix
                :tasks="filteredTasks"
                @select-task="handleSelectTask"
                @focus-task="handleOpenFocusMode" />
            </div>

            <!-- TIMELINE VIEW -->
            <div v-else class="h-full pb-4 px-1" :key="'timeline'">
              <TaskTimeline
                :tasks="filteredTasks"
                :projects="projects"
                @select-task="handleSelectTask"
                @focus-task="handleOpenFocusMode" />
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <TaskDetailModal
      :task="selectedTask"
      :is-open="isModalOpen && !isFocusModeOpen"
      @close="isModalOpen = false"
      @focus="handleOpenFocusMode" />

    <!-- Focus Mode Overlay -->
    <FocusMode
      :task="selectedTask"
      :is-open="isFocusModeOpen"
      @close="isFocusModeOpen = false"
      @complete="handleCompleteTask" />
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

/* Drawer slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Backdrop fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Drawer wrapper animation */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
