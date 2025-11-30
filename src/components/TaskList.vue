<script setup lang="ts">
import TaskCard from "./TaskCard.vue";
import type { Task } from "../types/global";
import { ref, watch, nextTick } from "vue";

const { tasks, selectedTaskId } = defineProps<{
  tasks: Task[];
  selectedTaskId?: string | number;
}>();

const taskRefs = ref<HTMLElement[]>([]);

watch(
  () => selectedTaskId,
  async (id) => {
    if (id == null) return;
    await nextTick();
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1 && taskRefs.value[index]) {
      taskRefs.value[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      taskRefs.value[index].classList.add("ring-2", "ring-indigo-400");
      setTimeout(
        () =>
          taskRefs.value[index]?.classList.remove("ring-2", "ring-indigo-400"),
        1500
      );
    }
  }
);
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <div v-for="(task, index) in tasks" :key="task.id" :ref="(el: any) => taskRefs[index] = el as HTMLElement">
      <TaskCard :task="task" />
    </div>
  </div>
</template>
