<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { vClickOutside } from "@/composables/useClickOutside";
import {
  X,
  Flag,
  Hash,
  Folder,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  Check,
  Timer,
} from "lucide-vue-next";
import type { Task, Priority } from "@/types/global";
import { useTasks } from "@/composables/useTask";

import { useProjectStore } from "../../stores/projects";
import { storeToRefs } from "pinia";
import { useTagState } from "@/composables/useTagState";
import DatePicker from "@/components/common/DatePicker.vue";

const props = defineProps<{
  task: Task | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "focus", task: Task): void;
}>();

const { t } = useI18n();
const { updateTask, removeTask, toggleTaskCompletion, addTask } = useTasks();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);
const { tags } = useTagState();

const editedTask = ref<Partial<Task>>({});
const isEditing = ref(false);

// Dropdown states
const isTagsDropdownOpen = ref(false);
const isProjectDropdownOpen = ref(false);
const isPriorityDropdownOpen = ref(false);

// Initialize editedTask when task changes
watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      editedTask.value = { ...newTask };
    } else {
      // Reset for new task
      editedTask.value = {
        title: "",
        description: "",
        priority: "medium",
        projectId: undefined,
        tags: [],
        dueDate: undefined,
        completed: false,
      };
    }
  },
  { immediate: true }
);

function handleSave() {
  if (props.task) {
    // Update existing task
    if (editedTask.value) {
      updateTask(props.task.id, editedTask.value);
      isEditing.value = false;
    }
  } else {
    // Create new task
    // Ensure we have at least a title
    if (editedTask.value.title) {
      addTask(
        editedTask.value.title,
        editedTask.value.projectId,
        editedTask.value.tags, // Pass tags
        editedTask.value.priority,
        editedTask.value.dueDate
      );
      emit("close");
    }
  }
}

import { useConfirm } from "@/composables/useConfirm";

const { confirm } = useConfirm();

async function handleDelete() {
  if (props.task) {
    const confirmed = await confirm({
      title: t("tasks.confirm_delete_title") || t("common.are_you_sure"),
      message: t("tasks.confirm_delete"),
      type: "danger",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      removeTask(props.task.id);
      emit("close");
    }
  }
}

function handleToggleComplete() {
  if (props.task) {
    toggleTaskCompletion(props.task.id);
    editedTask.value.completed = !editedTask.value.completed;
  }
}

// Tags functions
function toggleTagsDropdown() {
  isTagsDropdownOpen.value = !isTagsDropdownOpen.value;
}

function addTag(tagId: string) {
  editedTask.value.tags = [...(editedTask.value.tags || []), tagId];
  handleSave();
  isTagsDropdownOpen.value = false;
}

function removeTag(tagId: string) {
  editedTask.value.tags = editedTask.value.tags?.filter(
    (id: string) => id !== tagId
  );
  handleSave();
}

// Project functions
function toggleProjectDropdown() {
  isProjectDropdownOpen.value = !isProjectDropdownOpen.value;
}

function selectProject(projectId: string | undefined) {
  editedTask.value.projectId = projectId;
  handleSave();
  isProjectDropdownOpen.value = false;
}

function getProjectName(projectId: string | undefined) {
  if (!projectId) return t("tasks.without_project");
  return (
    projects.value.find((p: any) => p.id === projectId)?.title ||
    t("tasks.without_project")
  );
}

// Priority functions
function togglePriorityDropdown() {
  isPriorityDropdownOpen.value = !isPriorityDropdownOpen.value;
}

function selectPriority(priority: Priority | undefined) {
  editedTask.value.priority = priority;
  handleSave();
  isPriorityDropdownOpen.value = false;
}

function getPriorityLabel(priority: Priority | undefined) {
  if (!priority) return t("tasks.no_priority");
  return t(`tasks.${priority}`);
}

const priorityOptions: Array<{ value: Priority | undefined; label: string }> = [
  { value: undefined, label: t("tasks.no_priority") },
  { value: "low", label: t("tasks.low") },
  { value: "medium", label: t("tasks.medium") },
  { value: "high", label: t("tasks.high") },
  { value: "urgent", label: t("tasks.urgent") },
];

// Date picker computed for v-model
const dueDateModel = computed({
  get: () =>
    editedTask.value.dueDate
      ? new Date(editedTask.value.dueDate).toISOString().split("T")[0]
      : "",
  set: (value: string) => {
    editedTask.value.dueDate = value ? new Date(value) : undefined;
    handleSave();
  },
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      @click="emit('close')"></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-visible flex flex-col max-h-[90vh] animate-fade-in">
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <button
            @click="handleToggleComplete"
            class="transition-all duration-200 hover:scale-110 active:scale-95"
            :class="
              editedTask.completed
                ? 'text-green-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            ">
            <CheckCircle2
              v-if="editedTask.completed"
              class="w-6 h-6 fill-current" />
            <Circle v-else class="w-6 h-6" />
          </button>

          <span
            v-if="editedTask.completed"
            class="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            {{ t("tasks.completed") }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleDelete"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            :title="t('common.delete')">
            <Trash2 class="w-5 h-5" />
          </button>
          <button
            @click="emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Body - SIN SCROLL -->
      <div class="p-6 space-y-6">
        <!-- Title & Description -->
        <div class="space-y-4">
          <input
            v-model="editedTask.title"
            type="text"
            class="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors duration-200"
            :placeholder="t('tasks.task_title')"
            @blur="handleSave" />

          <textarea
            v-model="editedTask.description"
            rows="2"
            class="w-full text-gray-600 dark:text-gray-300 bg-transparent border-none focus:ring-0 p-0 resize-none placeholder-gray-400 transition-colors duration-200"
            :placeholder="t('tasks.add_description')"
            @blur="handleSave"></textarea>
        </div>

        <!-- Properties Grid -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <!-- Project Dropdown -->
          <div class="space-y-1">
            <label
              class="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >{{ t("tasks.project") }}</label
            >
            <div
              class="relative"
              v-click-outside="() => (isProjectDropdownOpen = false)">
              <button
                @click="toggleProjectDropdown"
                class="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                <div class="flex items-center gap-2">
                  <Folder class="w-4 h-4 text-gray-400" />
                  <span class="text-sm">{{
                    getProjectName(editedTask.projectId)
                  }}</span>
                </div>
                <ChevronDown
                  class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isProjectDropdownOpen }" />
              </button>

              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 -translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-2">
                <div
                  v-if="isProjectDropdownOpen"
                  class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div class="p-1 max-h-60 overflow-y-auto">
                    <button
                      @click="selectProject(undefined)"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors duration-150 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Folder class="w-3 h-3 text-gray-400" />
                        {{ t("tasks.without_project") }}
                      </div>
                      <Check
                        v-if="!editedTask.projectId"
                        class="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      v-for="project in projects"
                      :key="project.id"
                      @click="selectProject(project.id)"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors duration-150 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Folder class="w-3 h-3 text-gray-400" />
                        {{ project.title }}
                      </div>
                      <Check
                        v-if="editedTask.projectId === project.id"
                        class="w-4 h-4 text-indigo-600" />
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Priority Dropdown -->
          <div class="space-y-1">
            <label
              class="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >{{ t("tasks.priority") }}</label
            >
            <div
              class="relative"
              v-click-outside="() => (isPriorityDropdownOpen = false)">
              <button
                @click="togglePriorityDropdown"
                class="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                <div class="flex items-center gap-2">
                  <Flag class="w-4 h-4 text-gray-400" />
                  <span class="text-sm">{{
                    getPriorityLabel(editedTask.priority)
                  }}</span>
                </div>
                <ChevronDown
                  class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isPriorityDropdownOpen }" />
              </button>

              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 -translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-2">
                <div
                  v-if="isPriorityDropdownOpen"
                  class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div class="p-1">
                    <button
                      v-for="option in priorityOptions"
                      :key="option.value || 'none'"
                      @click="selectPriority(option.value)"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors duration-150 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Flag class="w-3 h-3 text-gray-400" />
                        {{ option.label }}
                      </div>
                      <Check
                        v-if="editedTask.priority === option.value"
                        class="w-4 h-4 text-indigo-600" />
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Date Picker -->
          <div class="space-y-1">
            <label
              class="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >{{ t("tasks.due_date") }}</label
            >
            <DatePicker v-model="dueDateModel" />
          </div>

          <!-- Tags -->
          <div class="space-y-1">
            <label
              class="text-xs font-medium text-gray-500 uppercase tracking-wider"
              >{{ t("tasks.tags") }}</label
            >
            <div
              class="flex flex-wrap gap-2 min-h-[42px] p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span
                v-for="tagId in editedTask.tags"
                :key="tagId"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 transition-all duration-200 hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                {{ tags.find((t: any) => t.id === tagId)?.name }}
                <button
                  @click="removeTag(tagId)"
                  class="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors duration-200">
                  <X class="w-3 h-3" />
                </button>
              </span>

              <!-- Add Tag Dropdown -->
              <div
                class="relative"
                v-click-outside="() => (isTagsDropdownOpen = false)">
                <button
                  @click="toggleTagsDropdown"
                  class="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200">
                  <Hash class="w-3 h-3" />
                  {{ t("common.add") }}
                  <ChevronDown
                    class="w-3 h-3 transition-transform duration-200"
                    :class="{ 'rotate-180': isTagsDropdownOpen }" />
                </button>

                <!-- Dropdown Menu with Transition -->
                <Transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 scale-95 -translate-y-2"
                  enter-to-class="opacity-100 scale-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 scale-100 translate-y-0"
                  leave-to-class="opacity-0 scale-95 -translate-y-2">
                  <div
                    v-if="isTagsDropdownOpen"
                    class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div class="p-1 max-h-40 overflow-y-auto">
                      <button
                        v-for="tag in tags.filter(
                          (t: any) => !editedTask.tags?.includes(t.id)
                        )"
                        :key="tag.id"
                        @click="addTag(tag.id)"
                        class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors duration-150 flex items-center gap-2">
                        <Hash class="w-3 h-3 text-gray-400" />
                        {{ tag.name }}
                      </button>
                      <div
                        v-if="
                          tags.filter((t: any) => !editedTask.tags?.includes(t.id))
                            .length === 0
                        "
                        class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {{ t("tags.no_tags") }}
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
        <button
          @click="props.task && emit('focus', props.task)"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all duration-200">
          <Timer class="w-4 h-4" />
          Iniciar Enfoque
        </button>
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
          {{ t("common.cancel") }}
        </button>
        <button
          @click="
            handleSave();
            emit('close');
          "
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/30">
          {{ t("common.save") }}
        </button>
      </div>
    </div>
  </div>
</template>
