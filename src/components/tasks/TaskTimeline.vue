<script setup lang="ts">
import { computed, ref } from "vue";
import type { Task, Project } from "@/types/global";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps<{
  tasks: Task[];
  projects: Project[];
}>();

const emit = defineEmits<{
  (e: "select-task", task: Task): void;
  (e: "focus-task", task: Task): void;
}>();

// Date Range Configuration
const daysToShow = 21; // 3 weeks
const startDate = ref(new Date());
// Align to start of week (Monday)
const day = startDate.value.getDay();
const diff = startDate.value.getDate() - day + (day === 0 ? -6 : 1);
startDate.value.setDate(diff);
startDate.value.setHours(0, 0, 0, 0);

const dates = computed(() => {
  const arr: Date[] = [];
  const start = new Date(startDate.value);
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    arr.push(d);
  }
  return arr;
});

const groupedByProject = computed(() => {
  const groups: Record<string, Task[]> = {};

  // Initialize with all projects to ensure they appear even if empty
  props.projects.forEach((p) => {
    groups[p.id] = [];
  });
  groups["uncategorized"] = [];

  props.tasks.forEach((t) => {
    // Only add if project exists in our list, otherwise uncategorized
    const pid = t.projectId;
    if (pid && groups[pid]) {
      groups[pid]!.push(t);
    } else {
      const uncategorized = groups["uncategorized"];
      if (uncategorized) {
        uncategorized.push(t);
      }
    }
  });

  return groups;
});

const getTaskStyle = (task: Task) => {
  // Logic:
  // Start: createdAt (or today if created before view start? no, absolute)
  // End: dueDate (or createdAt if no due date)

  if (!task.dueDate) return null; // Skip tasks without due date for now

  // Handle potentially empty dates array if something goes wrong, though computed guarantees content
  const firstDate = dates.value[0];
  const lastDate = dates.value[dates.value.length - 1];

  if (!firstDate || !lastDate) return null;

  const viewStart = firstDate.getTime();
  const viewEnd = lastDate.getTime() + 86400000;

  const taskStart = new Date(task.createdAt).getTime();
  const taskEnd = new Date(task.dueDate).getTime();

  // If task is completely out of view
  if (taskEnd < viewStart || taskStart > viewEnd) return null;

  // Calculate visual position
  const msPerDay = 86400000;
  const dayWidth = 48; // px (must match CSS grid layout)

  // Clamp start and end to view
  const effectiveStart = Math.max(taskStart, viewStart);
  const effectiveEnd = Math.min(taskEnd, viewEnd);

  // Position relative to view start in days
  const startOffsetDays = (effectiveStart - viewStart) / msPerDay;
  const durationDays = Math.max(
    0.5,
    (effectiveEnd - effectiveStart) / msPerDay
  ); // Min width 0.5 days

  return {
    left: `${startOffsetDays * dayWidth}px`,
    width: `${durationDays * dayWidth}px`,
  };
};

const getProjectColor = (color: string) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
  };
  return colors[color] || colors.indigo;
};

const formatDate = (d: Date | undefined) => {
  if (!d) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const isToday = (d: Date) => {
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const moveRange = (direction: "prev" | "next") => {
  const d = new Date(startDate.value);
  d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
  startDate.value = d;
};
</script>

<template>
  <div class="h-full flex flex-col glass-card rounded-2xl overflow-hidden">
    <!-- Toolbar -->
    <div
      class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">
        Timeline
      </h2>
      <div class="flex items-center gap-2">
        <button
          @click="moveRange('prev')"
          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft class="w-5 h-5 text-gray-500" />
        </button>
        <span class="text-sm font-medium tabular-nums">
          {{ formatDate(dates[0]) }} - {{ formatDate(dates[dates.length - 1]) }}
        </span>
        <button
          @click="moveRange('next')"
          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight class="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>

    <!-- Timeline Grid -->
    <div
      class="flex-1 overflow-auto custom-scrollbar relative bg-gray-50/30 dark:bg-gray-900/10">
      <!-- Headers Sticky -->
      <div
        class="flex sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 min-w-max">
        <div
          class="w-48 p-3 text-xs font-bold text-gray-500 uppercase shrink-0 sticky left-0 bg-white/95 dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-700 z-30">
          Project
        </div>
        <div class="flex">
          <div
            v-for="d in dates"
            :key="d.toISOString()"
            class="w-12 shrink-0 border-r border-gray-100 dark:border-gray-800 p-2 text-center text-xs flex flex-col items-center justify-center"
            :class="{ 'bg-indigo-50/50 dark:bg-indigo-900/20': isToday(d) }">
            <span opacity-50>{{
              d.toLocaleDateString(undefined, { weekday: "narrow" })
            }}</span>
            <span
              class="font-bold"
              :class="{ 'text-indigo-600 dark:text-indigo-400': isToday(d) }"
              >{{ d.getDate() }}</span
            >
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="min-w-max">
        <!-- Project Rows -->
        <div
          v-for="project in projects"
          :key="project.id"
          class="flex border-b border-gray-100 dark:border-gray-800 group">
          <!-- Project Label Sticky -->
          <div
            class="w-48 p-3 shrink-0 sticky left-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 z-10 flex items-center gap-2 group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
            <div
              class="w-3 h-3 rounded-full"
              :class="getProjectColor(project.color)"></div>
            <span class="text-sm font-medium truncate">{{
              project.title
            }}</span>
          </div>

          <!-- Timeline Lanes -->
          <div class="flex relative flex-1">
            <!-- Grid Lines Background -->
            <div class="absolute inset-0 flex pointer-events-none">
              <div
                v-for="d in dates"
                :key="d.toISOString()"
                class="w-12 shrink-0 border-r border-gray-100/50 dark:border-gray-800/50 h-full"
                :class="{
                  'bg-indigo-50/10 dark:bg-indigo-900/5': isToday(d),
                }"></div>
            </div>

            <!-- Task Bars -->
            <div class="relative h-12 w-full mt-2 mb-2">
              <template
                v-for="task in groupedByProject[project.id]"
                :key="task.id">
                <div
                  v-if="getTaskStyle(task)"
                  @click="emit('select-task', task)"
                  class="absolute top-1 h-8 rounded-lg shadow-sm border border-white/20 hover:brightness-110 cursor-pointer flex items-center px-2 overflow-hidden whitespace-nowrap z-0 hover:z-10 transition-all text-xs text-white font-medium select-none"
                  :class="[
                    getProjectColor(project.color),
                    { 'opacity-60 grayscale': task.completed },
                  ]"
                  :style="getTaskStyle(task)!"
                  :title="`${task.title} (${formatDate(
                    new Date(task.createdAt)
                  )} - ${formatDate(
                    task.dueDate ? new Date(task.dueDate) : undefined
                  )})`">
                  {{ task.title }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
