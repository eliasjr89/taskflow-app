<script setup lang="ts">
import type { Task, Project } from "@/types/global";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar as CalendarIcon,
  Flag,
  Timer,
} from "lucide-vue-next";

const props = defineProps<{
  tasks: Task[];
  projects: Project[]; // We need projects to show project names/colors
}>();

const emit = defineEmits<{
  (e: "select-task", task: Task): void;
  (e: "update:status", taskId: number, status: boolean): void;
  (e: "focus-task", task: Task): void;
}>();

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
    case "urgent":
      return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
    case "medium":
      return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400";
    default:
      return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400";
  }
};

const getProject = (projectId?: string | number) => {
  if (!projectId) return null;
  return props.projects.find((p) => p.id === projectId);
};

const getProjectColor = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[color] || colors.indigo;
};

const formatDate = (dateString?: Date | string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <div class="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
    <div class="overflow-x-auto flex-1 custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead
          class="bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
          <tr>
            <th
              class="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
              Status
            </th>
            <th
              class="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Task
            </th>
            <th
              class="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th
              class="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th
              class="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th
              class="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="task in tasks"
            :key="task.id"
            @click="emit('select-task', task)"
            class="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
            <!-- Status Checkbox -->
            <td class="py-3 px-6" @click.stop>
              <button
                @click="emit('update:status', task.id, !task.completed)"
                class="transition-transform active:scale-90 focus:outline-none">
                <CheckCircle2
                  v-if="task.completed"
                  class="w-5 h-5 text-emerald-500" />
                <Circle
                  v-else
                  class="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
              </button>
            </td>

            <!-- Task Title -->
            <td class="py-3 px-6">
              <span
                class="font-medium text-sm text-gray-900 dark:text-gray-100 transition-all font-heading"
                :class="{
                  'line-through text-gray-400 dark:text-gray-600':
                    task.completed,
                }">
                {{ task.title }}
              </span>
            </td>

            <!-- Project -->
            <td class="py-3 px-6">
              <div
                v-if="getProject(task.projectId)"
                class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  :class="getProjectColor(getProject(task.projectId)!.color)">
                  <span class="text-[10px] font-bold uppercase">{{
                    getProject(task.projectId)!.title.substring(0, 2)
                  }}</span>
                </div>
                <span
                  class="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                  {{ getProject(task.projectId)!.title }}
                </span>
              </div>
              <span v-else class="text-xs text-gray-400">-</span>
            </td>

            <!-- Priority -->
            <td class="py-3 px-6">
              <span
                v-if="task.priority"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                :class="getPriorityColor(task.priority)">
                <Flag class="w-3 h-3" />
                {{ task.priority }}
              </span>
              <span v-else class="text-xs text-gray-400">-</span>
            </td>

            <!-- Due Date -->
            <td class="py-3 px-6">
              <div
                v-if="task.dueDate"
                class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon class="w-4 h-4" />
                {{ formatDate(task.dueDate) }}
              </div>
              <span v-else class="text-xs text-gray-400">-</span>
            </td>

            <!-- Actions -->
            <td class="py-3 px-6 text-right" @click.stop>
              <button
                @click="emit('focus-task', task)"
                class="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                title="Modo Enfoque">
                <Timer class="w-4 h-4" />
              </button>
            </td>
          </tr>

          <!-- Empty State Row -->
          <tr v-if="tasks.length === 0">
            <td colspan="5" class="py-12 text-center text-gray-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <AlertCircle class="w-8 h-8 opacity-50" />
                <p>No tasks found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
