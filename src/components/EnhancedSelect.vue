<script setup lang="ts">
import { computed } from "vue";

interface Option {
  value: string | number;
  label: string;
  icon?: string;
  color?: string;
}

interface Props {
  modelValue: string | number | null;
  options: Option[];
  label?: string;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecciona una opción...",
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
}>();

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value === "" ? null : target.value;
  // Convert to number if original value was number
  const numValue = Number(value);
  emit("update:modelValue", isNaN(numValue) ? value : numValue);
};
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-1">*</span>
    </label>

    <div class="relative group">
      <!-- Icon -->
      <div
        v-if="icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <i
          :class="[
            'fa-solid',
            icon,
            'text-gray-400 transition-colors group-focus-within:text-primary',
          ]"></i>
      </div>

      <!-- Select -->
      <select
        :value="modelValue"
        @change="handleChange"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full rounded-lg border transition-all duration-200 appearance-none cursor-pointer',
          'bg-slate-800/50 text-white',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'hover:border-slate-600',
          icon ? 'pl-11 pr-10' : 'pl-4 pr-10',
          'py-3',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          modelValue ? 'border-slate-700' : 'border-slate-700/50',
        ]">
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Chevron Icon -->
      <div
        class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <i
          class="fa-solid fa-chevron-down text-xs text-gray-400 transition-transform group-focus-within:rotate-180 duration-200"></i>
      </div>

      <!-- Selected Option Icon (if available) -->
      <div
        v-if="selectedOption?.icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <i
          :class="[
            'fa-solid',
            selectedOption.icon,
            selectedOption.color || 'text-primary',
          ]"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
select option {
  background-color: #1e293b;
  color: white;
  padding: 0.75rem;
}

select option:hover {
  background-color: #334155;
}

/* Custom scrollbar for options */
select::-webkit-scrollbar {
  width: 8px;
}

select::-webkit-scrollbar-track {
  background: #1e293b;
}

select::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
