<script setup lang="ts">
import { ref, computed } from 'vue';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { vClickOutside } from '../composables/useClickOutside';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const currentDate = ref(new Date());

const selectedDate = computed({
  get: () => props.modelValue ? new Date(props.modelValue) : null,
  set: (value: Date | null) => {
    if (value) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      emit('update:modelValue', `${year}-${month}-${day}`);
      isOpen.value = false;
    }
  }
});

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
  
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    days.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false
    });
  }
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true
    });
  }
  
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
  }
  
  return days;
});

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

function selectDate(date: Date) {
  selectedDate.value = date;
}

function closeCalendar(event: Event) {
  // Don't close if clicking inside the picker container
  const target = event.target as HTMLElement;
  if (pickerContainer.value && pickerContainer.value.contains(target)) {
    return;
  }
  isOpen.value = false;
}

const pickerContainer = ref<HTMLElement | null>(null);

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
</script>

<template>
  <div class="relative" ref="pickerContainer">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
      :class="
        modelValue
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
          : 'text-gray-500 dark:text-gray-400'
      ">
      <Calendar class="w-4 h-4 flex-shrink-0" />
      <span class="text-sm font-medium whitespace-nowrap">
        {{
          modelValue
            ? new Date(modelValue).toLocaleDateString()
            : 'Fecha de vencimiento'
        }}
      </span>
    </button>

    <!-- Calendar Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95">
      <div
        v-if="isOpen"
        v-click-outside="closeCalendar"
        class="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 min-w-[320px]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            @click="previousMonth"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft class="w-4 h-4" />
          </button>
          
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {{ monthName }}
            </span>
            <button
              type="button"
              @click="goToToday"
              class="px-2 py-1 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
              Hoy
            </button>
          </div>
          
          <button
            type="button"
            @click="nextMonth"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Week Days -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
            {{ day }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            @click="selectDate(day.date)"
            class="aspect-square p-2 rounded-lg transition-all text-sm font-medium"
            :class="[
              day.isCurrentMonth
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'opacity-40',
              isToday(day.date)
                ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500'
                : '',
              isSelected(day.date)
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'text-gray-900 dark:text-gray-100'
            ]">
            {{ day.date.getDate() }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Click outside directive will be added via composable */
</style>
