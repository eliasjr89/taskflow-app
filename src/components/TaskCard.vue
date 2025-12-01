<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import type { Task } from "../types/global";
import { useConfetti } from "../composables/useConfetti";
import { useTaskState } from "../composables/useTaskState";
import { useTagState } from "../composables/useTagState";
import {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Music,
  Trash2,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: "toggle-complete", id: number): void;
  (e: "delete-task", id: number): void;
  (e: "edit-task", task: Task): void;
}>();

const { fireConfetti } = useConfetti();
const { projects } = useTaskState();
const { tags } = useTagState();

const isEditing = ref(false);
const editTitle = ref(props.task.title);
const titleInput = ref<HTMLInputElement | null>(null);

const iconMap: Record<string, any> = {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Music,
};

const project = computed(() => {
  return props.task.projectId
    ? projects.value.find((p) => p.id === props.task.projectId)
    : null;
});

const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
    purple:
      "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    pink: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    rose: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
    orange:
      "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    amber:
      "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    green:
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    teal: "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400",
    cyan: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[color] || colors.indigo;
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

const getPriorityColor = (priority?: string) => {
  const colors: Record<string, string> = {
    low: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    medium: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    high: "text-red-600 bg-red-50 dark:bg-red-900/20",
  };
  return priority ? colors[priority] || "text-gray-500" : "text-gray-500";
};

const getPriorityLabel = (priority?: string) => {
  const labels: Record<string, string> = {
    low: t("tasks.low"),
    medium: t("tasks.medium"),
    high: t("tasks.high"),
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
  emit("toggle-complete", props.task.id);
  if (!props.task.completed) {
    fireConfetti();
  }
}

function handleCardClick() {
  // Optional: Add a default action for card click if needed,
  // but ensure it doesn't interfere with checkbox or edit.
  // For now, it's just a placeholder for the new structure.
}
</script>

<template>
  <div
    class="group glass-card rounded-2xl p-6 relative overflow-hidden flex items-center gap-4"
    :class="{ 'opacity-60': task.completed }"
    @click="handleCardClick">
    <!-- Checkbox -->
    <div class="relative flex-shrink-0">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="toggleComplete"
        @click.stop
        class="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-indigo-500 bg-white dark:bg-gray-800 transition-all checked:bg-indigo-500 checked:border-indigo-600" />
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
          class="w-full bg-transparent border-b-2 border-indigo-500 focus:outline-none text-gray-800 dark:text-gray-100 px-1 py-0.5 text-lg" />
      </div>
      <h3
        v-else
        @dblclick="startEditing"
        class="text-lg font-medium transition-all duration-300 cursor-text select-none mb-2"
        :class="[
          task.completed
            ? 'text-gray-400 dark:text-gray-500 line-through decoration-2 decoration-indigo-500/30'
            : 'text-gray-800 dark:text-gray-100',
        ]">
        {{ task.title }}
      </h3>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Project Tag -->
        <div
        v-if="project"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
        :class="getColorClass(project.color)">
        <component :is="iconMap[project.icon] || Folder" class="w-3.5 h-3.5" />
        <span class="truncate max-w-[120px]">{{ project.title }}</span>
      </div>

        <!-- Priority Badge -->
        <div
          v-if="task.priority"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          :class="getPriorityColor(task.priority)">
          <Flag
            class="w-3.5 h-3.5"
            :class="{ 'fill-current': task.priority === 'high' }" />
          <span>{{ getPriorityLabel(task.priority) }}</span>
        </div>

      <!-- Tags -->
      <div v-if="taskTags.length > 0" class="flex flex-wrap gap-2">
        <span
        v-for="tag in taskTags"
        :key="tag?.id"
        :class="getTagColorClass(tag?.color || 'indigo')"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium">
        <Hash class="w-3.5 h-3.5" />
        {{ tag?.name }}
      </span>
    </div>
    
    <!-- Due Date Badge -->
    <div
      v-if="task.dueDate"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
      :class="getDueDateColor(task.dueDate)">
      <Calendar class="w-3.5 h-3.5" />
      <span>{{ formatDueDate(task.dueDate) }}</span>
    </div>
  </div>
    </div>

    <button
      @click="onDelete"
      class="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 flex-shrink-0"
      aria-label="Eliminar tarea">
      <Trash2 class="w-5 h-5" />
    </button>
  </div>
</template>
