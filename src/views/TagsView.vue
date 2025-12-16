<script setup lang="ts">
import { ref, computed } from "vue";
import { useTagState } from "../composables/useTagState";
import { useTaskState } from "../composables/useTaskState";
import AddTagModal from "../components/AddTagModal.vue";
import { Tags, Plus, Edit2, Trash2, Hash } from "lucide-vue-next";
import type { Tag } from "../types/global";
import { useI18n } from "vue-i18n";

const { tags, addTag, updateTag, deleteTag } = useTagState();
const { t } = useI18n();
const { tasks } = useTaskState();

const isModalOpen = ref(false);
const editingTag = ref<Tag | null>(null);

// Get tasks count for each tag
function getTaskCount(tagId: string) {
  return tasks.value.filter((t) => t.tags?.includes(tagId)).length;
}

// Get completed tasks count for each tag
function getCompletedCount(tagId: string) {
  return tasks.value.filter((t) => t.tags?.includes(tagId) && t.completed)
    .length;
}

// Calculate completion percentage
function getCompletionPercentage(tagId: string) {
  const total = getTaskCount(tagId);
  if (total === 0) return 0;
  const completed = getCompletedCount(tagId);
  return Math.round((completed / total) * 100);
}

// Sort tags by task count
const sortedTags = computed(() => {
  return [...tags.value].sort(
    (a, b) => getTaskCount(b.id) - getTaskCount(a.id)
  );
});

function openCreateModal() {
  editingTag.value = null;
  isModalOpen.value = true;
}

function openEditModal(tag: Tag) {
  editingTag.value = tag;
  isModalOpen.value = true;
}

function handleSaveTag(tag: Tag) {
  if (editingTag.value) {
    updateTag(tag.id, tag);
  } else {
    addTag(tag);
  }
  isModalOpen.value = false;
  editingTag.value = null;
}

function handleDeleteTag(tagId: string) {
  if (confirm(t("tags.delete_confirm_msg"))) {
    deleteTag(tagId);
  }
}

const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };
  return colors[color] || colors.indigo;
};
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8 animate-fade-in">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-8 text-center md:text-left">
      <div class="flex flex-col items-center md:items-start">
        <h1
          class="text-3xl md:text-4xl font-bold font-heading mb-2 flex items-center justify-center md:justify-start gap-2">
          <span>🏷️</span>
          <span
            class="bg-linear-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
            >{{ $t("tags.title") }}</span
          >
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t("tags.subtitle") }}
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 font-medium cursor-pointer">
        <Plus class="w-5 h-5" />
        {{ $t("tags.new_tag") }}
      </button>
    </div>

    <!-- Tags Grid -->
    <div
      v-if="sortedTags.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="tag in sortedTags"
        :key="tag.id"
        class="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="p-2 rounded-lg" :class="getColorClass(tag.color)">
              <Hash class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {{ tag.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getTaskCount(tag.id) }}
                {{
                  getTaskCount(tag.id) !== 1
                    ? t("calendar.tooltip_tasks")
                    : t("calendar.tooltip_task")
                }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              @click.stop="openEditModal(tag)"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer relative z-20"
              :title="t('common.edit')">
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              @click.stop="handleDeleteTag(tag.id)"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors relative z-20 cursor-pointer"
              :title="t('common.delete')">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">{{
              $t("projects.progress")
            }}</span>
            <span class="font-semibold text-gray-900 dark:text-gray-100">
              {{ getCompletionPercentage(tag.id) }}%
            </span>
          </div>
          <div
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="`bg-${tag.color}-500`"
              :style="{ width: `${getCompletionPercentage(tag.id)}%` }"></div>
          </div>
          <div
            class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span
              >{{ getCompletedCount(tag.id) }}
              {{ $t("common.completed").toLowerCase() }}</span
            >
            <span
              >{{ getTaskCount(tag.id) - getCompletedCount(tag.id) }}
              {{ $t("common.pending").toLowerCase() }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="glass-card rounded-2xl p-12 max-w-2xl mx-auto">
        <div
          class="mb-6 inline-flex p-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
          <Tags class="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {{ $t("tags.no_tags") || "No hay etiquetas" }}
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {{
            $t("tags.create_first") ||
            "Crea tu primera etiqueta para organizar tus tareas de manera más eficiente."
          }}
        </p>

        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 font-medium">
          <Plus class="w-5 h-5" />
          {{ $t("tags.new_tag") }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Tag Modal -->
    <AddTagModal
      :is-open="isModalOpen"
      :editing-tag="editingTag"
      @close="isModalOpen = false"
      @save="handleSaveTag" />
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in {
animation: fade-in 0.3s ease-out; }
