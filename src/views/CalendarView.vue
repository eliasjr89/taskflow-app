```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  X,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { useTaskState } from "../composables/useTaskState";
import AddTaskForm from "../components/AddTaskForm.vue";

const { t } = useI18n();
const { tasks } = useTaskState();

const isTaskModalOpen = ref(false);

// Estado del calendario
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);

// Navegación de meses
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthName = computed(() => {
  return currentDate.value.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
});

function previousMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
}

function goToToday() {
  currentDate.value = new Date();
  selectedDate.value = new Date();
}

// Generar días del mes
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  // Último día del mes
  const lastDay = new Date(year, month + 1, 0);

  // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
  let firstDayOfWeek = firstDay.getDay();
  // Ajustar para que Lunes sea 0
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days: Array<{
    date: Date;
    isCurrentMonth: boolean;
    tasksCount: number;
    completedCount: number;
  }> = [];

  // Días del mes anterior
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date,
      isCurrentMonth: false,
      tasksCount: getTasksForDate(date).length,
      completedCount: getTasksForDate(date).filter((t) => t.completed).length,
    });
  }

  // Días del mes actual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      isCurrentMonth: true,
      tasksCount: getTasksForDate(date).length,
      completedCount: getTasksForDate(date).filter((t) => t.completed).length,
    });
  }

  // Días del mes siguiente para completar la última semana
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        tasksCount: getTasksForDate(date).length,
        completedCount: getTasksForDate(date).filter((t) => t.completed).length,
      });
    }
  }

  return days;
});

// Obtener tareas para una fecha específica
function getTasksForDate(date: Date) {
  return tasks.value.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });
}

// Tareas del día seleccionado
const selectedDayTasks = computed(() => {
  if (!selectedDate.value) return [];
  return getTasksForDate(selectedDate.value);
});

function selectDate(date: Date) {
  selectedDate.value = date;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isSelected(date: Date): boolean {
  if (!selectedDate.value) return false;
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  );
}

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8 animate-fade-in">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-8 text-center md:text-left">
      <div class="flex flex-col items-center md:items-start">
        <h1
          class="text-3xl md:text-4xl font-bold font-heading mb-2 flex items-center justify-center md:justify-start gap-2">
          <span>📅</span>
          <span
            class="bg-linear-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
            >{{ t("calendar.title") }}</span
          >
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("calendar.subtitle") }}
        </p>
      </div>

      <!-- Navigation -->
      <div class="flex items-center gap-3">
        <button
          @click="isTaskModalOpen = true"
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-medium shadow-lg shadow-indigo-500/30 flex items-center gap-2">
          <Plus class="w-4 h-4" />
          {{ t("tasks.add_task") }}
        </button>

        <button
          @click="goToToday"
          class="px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
          Hoy
        </button>

        <div class="flex items-center gap-2 glass-card px-2 py-1.5 rounded-xl">
          <button
            @click="previousMonth"
            class="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="Mes anterior">
            <ChevronLeft class="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <span
            class="px-4 text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize min-w-[180px] text-center">
            {{ monthName }}
          </span>

          <button
            @click="nextMonth"
            class="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="Mes siguiente">
            <ChevronRight class="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="lg:col-span-2">
        <div class="glass-card rounded-2xl p-6">
          <!-- Week Days Header -->
          <div class="grid grid-cols-7 gap-2 mb-4">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
              {{ day }}
            </div>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="selectDate(day.date)"
              class="aspect-square p-2 rounded-xl transition-all duration-200 relative group"
              :class="[
                day.isCurrentMonth
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-600',
                isToday(day.date)
                  ? 'bg-white dark:bg-gray-800 border-2 border-indigo-500 dark:border-indigo-400 shadow-lg'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                isSelected(day.date)
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                  : '',
              ]">
              <div class="flex flex-col items-center justify-center h-full">
                <span class="text-sm font-medium mb-1">
                  {{ day.date.getDate() }}
                </span>

                <!-- Task Indicators -->
                <div v-if="day.tasksCount > 0" class="flex gap-0.5">
                  <div
                    v-for="i in Math.min(day.tasksCount, 3)"
                    :key="i"
                    class="w-1 h-1 rounded-full"
                    :class="
                      i <= day.completedCount ? 'bg-green-500' : 'bg-indigo-500'
                    "></div>
                  <span v-if="day.tasksCount > 3" class="text-[8px] ml-0.5"
                    >+</span
                  >
                </div>
              </div>

              <!-- Tooltip on hover -->
              <div
                v-if="day.tasksCount > 0"
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {{ day.tasksCount }} tarea{{ day.tasksCount > 1 ? "s" : "" }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Selected Day Tasks -->
      <div class="lg:col-span-1">
        <div class="glass-card rounded-2xl p-6 sticky top-24">
          <div v-if="selectedDate" class="space-y-4">
            <div
              class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
              <CalendarIcon
                class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                  {{
                    selectedDate.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                    })
                  }}
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ selectedDayTasks.length }} {{ t("calendar.tasks")
                  }}{{ selectedDayTasks.length !== 1 ? "s" : "" }}
                </p>
              </div>
            </div>

            <!-- Tasks List -->
            <div
              v-if="selectedDayTasks.length > 0"
              class="space-y-2 max-h-[500px] overflow-y-auto">
              <div
                v-for="task in selectedDayTasks"
                :key="task.id"
                class="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                <div class="flex items-start gap-2">
                  <input
                    type="checkbox"
                    :checked="task.completed"
                    disabled
                    class="mt-1 h-4 w-4 rounded-full border-2 border-indigo-500"
                    :class="
                      task.completed ? 'bg-indigo-500' : 'bg-transparent'
                    " />
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium truncate"
                      :class="
                        task.completed
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-900 dark:text-gray-100'
                      ">
                      {{ task.title }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t("calendar.no_tasks") }}
              </p>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <CalendarIcon
              class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t("calendar.select_day") }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div
      v-if="isTaskModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="isTaskModalOpen = false"></div>
      <div
        class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">{{ t("common.create") }}</h3>
          <button
            @click="isTaskModalOpen = false"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        <AddTaskForm @task-added="isTaskModalOpen = false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
