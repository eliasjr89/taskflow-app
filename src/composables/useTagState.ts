// src/composables/useTagState.ts
import { ref } from "vue";
import type { Tag } from "../types/global";
import api from "../services/api";

const tags = ref<Tag[]>([]);

// Data Mapping
const mapTag = (t: any): Tag => ({
  id: String(t.id),
  name: t.name,
  color: t.color || "blue", // Default if not provided
  createdAt: t.created_at ? new Date(t.created_at) : new Date(),
});

// Load from API
const loadTags = async () => {
  try {
    const res = await api.get("/tags");
    const data = res.data.data || res.data || [];
    tags.value = Array.isArray(data) ? data.map(mapTag) : [];
  } catch {
    // Silent fail
  }
};

loadTags();

// Tag Methods
const addTag = async (tag: Tag) => {
  try {
    await api.post("/tags", { name: tag.name });
    await loadTags();
  } catch {
    // Error handling
  }
};

const updateTag = async (tagId: string, updates: Partial<Tag>) => {
  try {
    if (updates.name) {
      await api.put(`/tags/${tagId}`, { name: updates.name });
      await loadTags();
    }
  } catch {
    // Error handling
  }
};

const deleteTag = async (tagId: string) => {
  try {
    await api.delete(`/tags/${tagId}`);
    await loadTags();
  } catch {
    // Error handling
  }
};

const getTagById = (tagId: string) => {
  return tags.value.find((t) => t.id === tagId);
};

export function useTagState() {
  return {
    tags,
    loadTags,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
  };
}
