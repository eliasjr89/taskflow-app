import { ref, computed } from "vue";
import { useTaskState } from "./useTaskState";
import type { FilterState } from "../types/global";

// Global filter state to persist across views if needed, or we can make it local.
// For now, let's keep it local per usage or create a singleton if requirements say "persist filters".
// User didn't explicitly ask for persistence, but usually it's nice.
// However, the previous code in TasksView was local. I'll make it return a composable that holds state.

const filters = ref<FilterState>({
  search: "",
  statuses: [],
  priorities: [],
  projectIds: [],
  tagIds: [],
});

export function useTaskFilter() {
  const { tasks } = useTaskState();

  const filteredTasks = computed(() => {
    return tasks.value.filter((task) => {
      // 1. Search Filter
      if (
        filters.value.search &&
        !task.title.toLowerCase().includes(filters.value.search.toLowerCase())
      ) {
        return false;
      }

      // 2. Status Filter
      if (filters.value.statuses.length > 0) {
        const status = task.completed ? "completed" : "pending";
        if (!filters.value.statuses.includes(status)) {
          return false;
        }
      }

      // 3. Priority Filter
      if (filters.value.priorities.length > 0) {
        if (
          !task.priority ||
          !filters.value.priorities.includes(task.priority)
        ) {
          return false;
        }
      }

      // 4. Project Filter
      if (filters.value.projectIds.length > 0) {
        if (
          !task.projectId ||
          !filters.value.projectIds.includes(task.projectId.toString())
        ) {
          return false;
        }
      }

      // 5. Tag Filter
      if (filters.value.tagIds.length > 0) {
        if (
          !task.tags ||
          !task.tags.some((tagId) =>
            filters.value.tagIds.includes(tagId.toString())
          )
        ) {
          return false;
        }
      }

      return true;
    });
  });

  const resetFilters = () => {
    filters.value = {
      search: "",
      statuses: [],
      priorities: [],
      projectIds: [],
      tagIds: [],
    };
  };

  return {
    filters,
    filteredTasks,
    resetFilters,
  };
}
