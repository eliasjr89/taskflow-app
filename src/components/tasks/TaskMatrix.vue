<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/types/global";
import {
  AlertTriangle,
  Flame,
  Flag,
  Coffee,
  CheckCircle2,
  Timer,
} from "lucide-vue-next";

const props = defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: "select-task", task: Task): void;
  (e: "focus-task", task: Task): void;
}>();

// Filter only pending tasks for the matrix usually, but we can include all.
// Usually Eisenhower is for deciding what to DO, so pending makes most sense.
// However, seeing completed tasks dimmed helps context.
const matrixTasks = computed(() => {
  return props.tasks; // Or props.tasks.filter(t => !t.completed)
});

const quadrants = computed(() => {
  return {
    urgent: {
      title: "Urgente & Importante",
      subtitle: "Hacer ahora",
      color: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
      icon: Flame,
      iconColor: "text-red-500",
      tasks: matrixTasks.value.filter((t) => t.priority === "urgent"),
    },
    high: {
      title: "Importante, No Urgente",
      subtitle: "Planificar",
      color:
        "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      tasks: matrixTasks.value.filter((t) => t.priority === "high"),
    },
    medium: {
      title: "Urgente, No Importante",
      subtitle: "Delegar / Rápido",
      color:
        "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
      icon: Flag,
      iconColor: "text-blue-500", // Using blue for medium standard
      tasks: matrixTasks.value.filter((t) => t.priority === "medium"),
    },
    low: {
      title: "Ni Urgente, Ni Importante",
      subtitle: "Eliminar / Posponer",
      color:
        "bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800",
      icon: Coffee,
      iconColor: "text-slate-500",
      tasks: matrixTasks.value.filter(
        (t) => t.priority === "low" || !t.priority
      ),
    },
  };
});
</script>

<template>
  <div class="h-full grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
    <!-- Quadrant Loop -->
    <div
      v-for="(quadrant, key) in quadrants"
      :key="key"
      class="glass-card rounded-2xl p-4 flex flex-col h-full border-2 overflow-hidden transition-all hover:shadow-lg"
      :class="quadrant.color">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3 shrink-0">
        <div class="flex items-center gap-2">
          <component
            :is="quadrant.icon"
            class="w-5 h-5"
            :class="quadrant.iconColor" />
          <div>
            <h3
              class="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base">
              {{ quadrant.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {{ quadrant.subtitle }}
            </p>
          </div>
        </div>
        <span
          class="bg-white/50 dark:bg-black/20 px-2 py-1 rounded text-xs font-bold text-gray-600 dark:text-gray-300">
          {{ quadrant.tasks.length }}
        </span>
      </div>

      <!-- Task List -->
      <div
        class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 min-h-0">
        <button
          v-for="task in quadrant.tasks"
          :key="task.id"
          @click="emit('select-task', task)"
          class="w-full text-left bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
          <div class="flex items-start gap-2">
            <CheckCircle2
              v-if="task.completed"
              class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div
              v-else
              class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 mt-0.5 shrink-0 group-hover:border-indigo-400 transition-colors"></div>

            <div class="min-w-0">
              <p
                class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
                :class="{ 'line-through opacity-50': task.completed }">
                {{ task.title }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <span
                  v-if="task.dueDate"
                  class="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {{
                    new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                </span>
              </div>
            </div>

            <!-- Focus Mode Button -->
            <div
              class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop>
              <button
                @click="emit('focus-task', task)"
                class="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                title="Modo Enfoque">
                <Timer class="w-4 h-4" />
              </button>
            </div>
          </div>
        </button>

        <div
          v-if="quadrant.tasks.length === 0"
          class="h-full flex flex-col items-center justify-center text-center opacity-40 min-h-[100px]">
          <component :is="quadrant.icon" class="w-8 h-8 mb-2" />
          <p class="text-xs">Sin tareas</p>
        </div>
      </div>
    </div>
  </div>
</template>
