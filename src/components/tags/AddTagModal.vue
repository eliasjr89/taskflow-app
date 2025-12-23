<script setup lang="ts">
import { ref, computed } from "vue";

import type { Tag } from "@/types/global";

const props = defineProps<{
  isOpen: boolean;
  editingTag?: Tag | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", tag: Tag): void;
}>();

const tagName = ref("");
const selectedColor = ref("indigo");

const colors = [
  { name: "white", class: "bg-white" },
  { name: "indigo", class: "bg-indigo-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "pink", class: "bg-pink-500" },
  { name: "rose", class: "bg-rose-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "amber", class: "bg-amber-500" },
  { name: "yellow", class: "bg-yellow-500" },
  { name: "lime", class: "bg-lime-500" },
  { name: "green", class: "bg-green-500" },
  { name: "emerald", class: "bg-emerald-500" },
  { name: "teal", class: "bg-teal-500" },
  { name: "cyan", class: "bg-cyan-500" },
  { name: "sky", class: "bg-sky-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "violet", class: "bg-violet-500" },
  { name: "fuchsia", class: "bg-fuchsia-500" },
  { name: "stone", class: "bg-stone-500" },
  { name: "gray", class: "bg-gray-500" },
  { name: "slate", class: "bg-slate-500" },
];

// Initialize with editing tag if provided
if (props.editingTag) {
  tagName.value = props.editingTag.name;
  selectedColor.value = props.editingTag.color;
}

const isValid = computed(() => tagName.value.trim().length > 0);

function handleSave() {
  if (!isValid.value) return;

  const tag: Tag = {
    id: props.editingTag?.id || `tag-${Date.now()}`,
    name: tagName.value.trim(),
    color: selectedColor.value,
    createdAt: props.editingTag?.createdAt || new Date(),
  };

  emit("save", tag);
  handleClose();
}

function handleClose() {
  tagName.value = "";
  selectedColor.value = "indigo";
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-10000 flex items-center justify-center p-4"
        @click.self="handleClose">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div
          class="relative glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {{ editingTag ? $t("tags.edit_tag") : $t("tags.new_tag") }}
          </h2>

          <form @submit.prevent="handleSave" class="space-y-6">
            <!-- Name Input -->
            <div>
              <label
                for="tag-name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ $t("tags.name_label") }}
              </label>
              <input
                id="tag-name"
                v-model="tagName"
                type="text"
                :placeholder="$t('tags.name_placeholder')"
                class="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                autofocus />
            </div>

            <!-- Color Selector -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {{ $t("tags.color_label") }}
              </label>
              <div class="grid grid-cols-5 gap-3">
                <button
                  v-for="color in colors"
                  :key="color.name"
                  type="button"
                  @click="selectedColor = color.name"
                  class="w-full aspect-square rounded-xl transition-all duration-200 hover:scale-110"
                  :class="[
                    color.class,
                    selectedColor === color.name
                      ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110'
                      : 'opacity-70 hover:opacity-100',
                  ]"></button>
              </div>
            </div>

            <!-- Preview -->
            <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{ $t("tags.preview") }}
              </p>
              <span
                v-if="tagName.trim()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="`bg-${selectedColor}-100 dark:bg-${selectedColor}-900/30 text-${selectedColor}-700 dark:text-${selectedColor}-300`">
                {{ tagName }}
              </span>
              <span v-else class="text-sm text-gray-400 dark:text-gray-500">
                {{ $t("tags.preview_empty") }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                type="button"
                @click="handleClose"
                class="flex-1 px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                {{ $t("common.cancel") }}
              </button>
              <button
                type="submit"
                :disabled="!isValid"
                class="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors font-medium shadow-lg shadow-indigo-500/30">
                {{ editingTag ? $t("common.save") : $t("common.add") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
