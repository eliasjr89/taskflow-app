import { ref, computed } from "vue";
import { useTaskState } from "./useTaskState";

const filter = ref<"all" | "pending" | "completed">("all");

export function useTaskFilter() {
  const { pendingTasks, completedTasks } = useTaskState();

  const filteredTasks = computed(() => {
    if (filter.value === "pending") return pendingTasks.value;
    if (filter.value === "completed") return completedTasks.value;

    // all
    return [...pendingTasks.value, ...completedTasks.value];
  });

  const setFilter = (value: "all" | "pending" | "completed") => {
    filter.value = value;
  };

  return {
    filter,
    filteredTasks,
    setFilter,
  };
}
