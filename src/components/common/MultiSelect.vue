<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Option {
  value: string | number;
  label: string;
  icon?: string;
  color?: string;
}

interface Props {
  modelValue: (string | number)[];
  options: Option[];
  label?: string;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: "Selecciona opciones...",
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: (string | number)[]): void;
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((opt) => opt.label.toLowerCase().includes(query));
});

const selectedOptions = computed(() => {
  return props.options.filter((opt) => props.modelValue.includes(opt.value));
});

const toggleOption = (value: string | number) => {
  const newValues = [...props.modelValue];
  const index = newValues.indexOf(value);
  if (index === -1) {
    newValues.push(value);
  } else {
    newValues.splice(index, 1);
  }
  emit("update:modelValue", newValues);
};

const removeOption = (value: string | number) => {
  const newValues = props.modelValue.filter((v) => v !== value);
  emit("update:modelValue", newValues);
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="space-y-2" ref="containerRef">
    <label v-if="label" class="block text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-1">*</span>
    </label>

    <div class="relative group">
      <!-- trigger area -->
      <div
        @click="!disabled && (isOpen = !isOpen)"
        :class="[
          'w-full rounded-lg border transition-all duration-200 min-h-[50px] cursor-pointer',
          'bg-slate-800/50 text-white',
          'hover:border-slate-600',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-slate-700/50',
          'py-2 px-3 flex flex-wrap gap-2 items-center',
        ]">
        <!-- Initial Icon -->
        <i v-if="icon" :class="['fa-solid mr-1', icon, 'text-gray-400']"></i>

        <!-- Placeholder if empty -->
        <span
          v-if="selectedOptions.length === 0"
          class="text-gray-400 text-sm pl-1">
          {{ placeholder }}
        </span>

        <!-- Tags -->
        <span
          v-for="opt in selectedOptions"
          :key="opt.value"
          class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-xs flex items-center gap-1 group/tag">
          {{ opt.label }}
          <button
            type="button"
            @click.stop="removeOption(opt.value)"
            class="hover:text-white ml-1 focus:outline-none">
            <i class="fa-solid fa-xmark text-[10px]"></i>
          </button>
        </span>

        <!-- Chevron -->
        <div class="ml-auto pointer-events-none">
          <i
            class="fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"></i>
        </div>
      </div>

      <!-- Dropdown -->
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[250px]">
        <!-- Search -->
        <div
          class="p-2 border-b border-slate-700/50 sticky top-0 bg-slate-800 z-10">
          <div class="relative">
            <i
              class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 pl-8 pr-3 text-sm text-white focus:border-primary focus:outline-none placeholder-gray-500"
              placeholder="Buscar..."
              @click.stop />
          </div>
        </div>

        <!-- Options -->
        <div class="overflow-y-auto p-1 custom-scrollbar flex-1">
          <div
            v-if="filteredOptions.length === 0"
            class="p-4 text-center text-sm text-gray-500">
            No se encontraron resultados
          </div>
          <button
            v-for="opt in filteredOptions"
            :key="opt.value"
            type="button"
            @click.stop="toggleOption(opt.value)"
            class="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-slate-700/50 transition-colors text-sm group/opt">
            <!-- Checkbox visual -->
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
              :class="
                modelValue.includes(opt.value)
                  ? 'bg-primary border-primary'
                  : 'border-slate-500 group-hover/opt:border-gray-400'
              ">
              <i
                v-if="modelValue.includes(opt.value)"
                class="fa-solid fa-check text-white text-[10px]"></i>
            </div>

            <span
              :class="
                modelValue.includes(opt.value)
                  ? 'text-white font-medium'
                  : 'text-gray-300'
              ">
              {{ opt.label }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
