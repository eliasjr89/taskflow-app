<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task } from "@/types/global";
import { useConfetti } from "../../composables/useConfetti";
import { useProjectStore } from "../../stores/projects";
import { storeToRefs } from "pinia";
import { useTagState } from "../../composables/useTagState";
import {
  Folder,
  Trash2,
  Hash,
  Pencil,
  Flag,
  Calendar,
  Timer,
  CheckCircle2,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: "toggle-complete", id: number): void;
  (e: "delete-task", id: number): void;
  (e: "edit-task", task: Task): void;
  (e: "select-task", task: Task): void;
  (e: "focus-task", task: Task): void;
}>();

const { triggerConfetti } = useConfetti();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);
const { tags } = useTagState();

const isEditing = ref(false);
const editTitle = ref(props.task.title);

const project = computed(() => {
  return props.task.projectId
    ? projects.value.find((p) => p.id === props.task.projectId)
    : null;
});

const getPriorityColorStrip = (priority?: string) => {
  const colors: Record<string, string> = {
    low: "bg-blue-500",
    medium: "bg-orange-500",
    high: "bg-red-500",
    urgent: "bg-rose-600",
  };
  return priority ? colors[priority] || "bg-gray-400" : "bg-gray-400";
};

const taskTags = computed(() => {
  if (!props.task.tags || props.task.tags.length === 0) return [];
  return props.task.tags
    .map((tagId) => tags.value.find((t) => t.id === tagId))
    .filter(Boolean);
});

const getTagColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };
  return colors[color] || colors.indigo;
};

const getPriorityLabel = (priority?: string) => {
  const labels: Record<string, string> = {
    low: t("tasks.low"),
    medium: t("tasks.medium"),
    high: t("tasks.high"),
    urgent: t("tasks.urgent"),
  };
  return priority ? labels[priority] || "" : "";
};

const getDueDateColor = (date?: Date | string) => {
  if (!date) return "text-gray-500";
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  if (d < now) return "text-red-600 font-medium"; // Overdue
  if (d.getTime() === now.getTime()) return "text-orange-600 font-medium"; // Today
  return "text-gray-500 dark:text-gray-400";
};

const formatDueDate = (date?: Date | string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

function onDelete() {
  emit("delete-task", props.task.id);
}

function startEditing() {
  if (props.task.completed) return;
  isEditing.value = true;
  // emit("select-task", props.task); // Changed behavior to support inline editing
}

function saveEdit() {
  if (!isEditing.value) return;
  if (editTitle.value.trim()) {
    emit("edit-task", { ...props.task, title: editTitle.value });
  } else {
    editTitle.value = props.task.title;
  }
  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editTitle.value = props.task.title;
}

function toggleComplete() {
  const wasCompleted = props.task.completed;
  emit("toggle-complete", props.task.id);
  // Fire confetti when marking as complete (not when unmarking)
  if (!wasCompleted) {
    triggerConfetti();
  }
}
</script>

<template>
  <div
    class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 group overflow-hidden cursor-pointer"
    :class="{ 'opacity-75': task.completed }">
    <!-- Status/Priority Stripe -->
    <div
      class="absolute top-0 left-0 w-1.5 h-full transition-colors"
      :class="
        task.completed ? 'bg-green-500' : getPriorityColorStrip(task.priority)
      "></div>

    <!-- Header: Checkbox + Title -->
    <div class="flex items-start gap-4 mb-3 pl-2">
      <!-- Custom Checkbox / Icon Wrapper -->
      <div
        class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer shadow-sm"
        :class="
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-transparent hover:border-indigo-500 group-hover:shadow-md'
        "
        @click.stop="toggleComplete">
        <CheckCircle2 v-if="task.completed" class="w-6 h-6" />
        <div
          v-else
          class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-500 group-hover:border-indigo-500"></div>
      </div>

      <!-- Title & Project -->
      <div class="flex-1 min-w-0">
        <div v-if="isEditing" class="flex items-center gap-2" @click.stop>
          <input
            v-model="editTitle"
            @blur="saveEdit"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            type="text"
            class="w-full bg-transparent border-b-2 border-indigo-500 focus:outline-none text-gray-800 dark:text-gray-100 font-bold"
            autoFocus />
        </div>
        <h3
          v-else
          @dblclick="startEditing"
          class="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight mb-1 transition-colors cursor-text"
          :class="{
            'line-through text-gray-400 dark:text-gray-500': task.completed,
          }">
          {{ task.title }}
        </h3>

        <!-- Project Badge (Subtitle) -->
        <div
          class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Folder class="w-3 h-3" />
          <span class="truncate max-w-[150px]">{{
            project?.title || t("tasks.without_project")
          }}</span>
        </div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div class="pl-2 mb-4 space-y-2">
      <!-- Date & Priority Row -->
      <div class="flex items-center gap-4 text-xs">
        <div
          class="flex items-center gap-1.5"
          :class="getDueDateColor(task.dueDate)">
          <Calendar class="w-3.5 h-3.5" />
          <span class="font-medium">{{ formatDueDate(task.dueDate) }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Flag
            class="w-3.5 h-3.5"
            :class="{
              'fill-current text-red-500': task.priority === 'urgent',
            }" />
          <span class="capitalize">{{ getPriorityLabel(task.priority) }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="taskTags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
        <span
          v-for="tag in taskTags"
          :key="tag?.id"
          :class="getTagColorClass(tag?.color || 'indigo')"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border border-current/20">
          <Hash class="w-3 h-3" />
          {{ tag?.name }}
        </span>
      </div>
    </div>

    <!-- Footer: Actions -->
    <div
      class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 pl-2">
      <button
        @click.stop="emit('focus-task', props.task)"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer"
        :title="t('common.focus') || 'Focus'">
        <Timer class="w-4 h-4" />
      </button>
      <button
        @click.stop="startEditing"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer"
        :title="t('common.edit')">
        <Pencil class="w-4 h-4" />
      </button>
      <button
        @click.stop="onDelete"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
        :title="t('common.delete')">
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
