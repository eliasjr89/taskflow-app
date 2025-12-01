// src/composables/useTagState.ts
import { ref, watch } from "vue";
import type { Tag } from "../types/global";

const tags = ref<Tag[]>([]);

// Load from localStorage
const loadTagState = () => {
  const storedTags = localStorage.getItem("tags");
  if (storedTags) {
    tags.value = JSON.parse(storedTags, (key, value) => {
      if (key === "createdAt") return new Date(value);
      return value;
    });
  }
};

loadTagState();

// Tag Methods
const addTag = (tag: Tag) => {
  tags.value.push(tag);
};

const updateTag = (tagId: string, updates: Partial<Tag>) => {
  const tag = tags.value.find((t) => t.id === tagId);
  if (tag) {
    Object.assign(tag, updates);
  }
};

const deleteTag = (tagId: string) => {
  tags.value = tags.value.filter((t) => t.id !== tagId);
};

const getTagById = (tagId: string) => {
  return tags.value.find((t) => t.id === tagId);
};

// Persist to localStorage
watch(
  tags,
  () => {
    localStorage.setItem("tags", JSON.stringify(tags.value));
  },
  { deep: true }
);

export function useTagState() {
  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
  };
}
