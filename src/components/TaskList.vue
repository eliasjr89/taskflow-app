<script setup lang="ts">
import TaskCard from "./TaskCard.vue";
import type { Task } from "../types/global";

const { tasks } = defineProps<{ tasks: Task[] }>();
</script>

<template>
  <div class="flex flex-col gap-3">
    <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
  </div>
</template>
