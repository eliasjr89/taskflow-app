<script setup lang="ts">
import { computed, ref } from "vue";
import type { Task } from "@/types/global";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-vue-next";

const props = defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: "select-task", task: Task): void;
}>();

const currentDate = ref(new Date());

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const monthYear = computed(() => {
  return currentDate.value.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days = [];

  // Previous month padding
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevDate = new Date(year, month, -startDayOfWeek + 1 + i);
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      tasks: getTasksForDate(prevDate),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date: date,
      isCurrentMonth: true,
      tasks: getTasksForDate(date),
    });
  }

  // Next month padding
  const remainingCells = 42 - days.length; // 6 rows * 7 cols
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      tasks: getTasksForDate(nextDate),
    });
  }

  return days;
});

function getTasksForDate(date: Date) {
  return props.tasks.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });
}

function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
}

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getPriorityColor(priority?: string) {
  switch (priority) {
    case "high":
    case "urgent":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
}
</script>

<template>
  <div class="h-full flex flex-col glass-card rounded-2xl overflow-hidden">
    <!-- Calendar Header -->
    <div
      class="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <h2
        class="text-xl font-bold capitalize text-gray-800 dark:text-gray-100 font-heading">
        {{ monthYear }}
      </h2>
      <div class="flex items-center gap-2">
        <button
          @click="prevMonth"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          @click="() => (currentDate = new Date())"
          class="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
          Hoy
        </button>
        <button
          @click="nextMonth"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300">
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] min-h-0">
      <!-- Days Header -->
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="py-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        {{ day }}
      </div>

      <!-- Days Cells -->
      <div class="contents">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="relative border-b border-r border-gray-100 dark:border-gray-800 p-2 min-h-[100px] transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-800/30 flex flex-col gap-1"
          :class="{
            'bg-gray-50/80 dark:bg-gray-900/80 text-gray-400':
              !day.isCurrentMonth,
            'bg-indigo-50/10 dark:bg-indigo-900/10': isToday(day.date),
          }">
          <div class="flex justify-between items-start mb-1">
            <span
              class="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full"
              :class="{
                'bg-indigo-600 text-white shadow-md shadow-indigo-500/30':
                  isToday(day.date),
                'text-gray-700 dark:text-gray-300': !isToday(day.date),
              }">
              {{ day.date.getDate() }}
            </span>
          </div>

          <!-- Tasks for the day -->
          <div
            class="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[120px]">
            <button
              v-for="task in day.tasks"
              :key="task.id"
              @click="emit('select-task', task)"
              class="text-left text-xs px-2 py-1.5 rounded-md truncate border transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center gap-1.5"
              :class="[
                task.completed
                  ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 line-through'
                  : getPriorityColor(task.priority),
              ]">
              <CheckCircle2 v-if="task.completed" class="w-3 h-3 shrink-0" />
              <Clock v-else class="w-3 h-3 shrink-0" />
              <span class="truncate">{{ task.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom grid logic for days usually handled by utility classes but exact Calendar grid sometimes needs explicit rows */
</style>
