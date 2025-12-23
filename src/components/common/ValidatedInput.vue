<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  required: false,
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "blur"): void;
}>();

const hasError = computed(() => props.error && props.error.length > 0);

const inputClasses = computed(() => [
  "w-full px-4 py-3 rounded-lg border transition-all duration-200",
  "bg-slate-800/50 text-white placeholder-gray-400",
  "focus:outline-none focus:ring-2",
  hasError.value
    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
    : "border-slate-700 focus:border-primary focus:ring-primary/20",
  props.disabled && "opacity-50 cursor-not-allowed",
  props.readonly && "cursor-default",
]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleBlur = () => {
  emit("blur");
};
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-1">*</span>
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="inputClasses"
      @input="handleInput"
      @blur="handleBlur" />

    <p v-if="hasError" class="text-sm text-red-400 flex items-center gap-1">
      <i class="fa-solid fa-circle-exclamation"></i>
      {{ error }}
    </p>
  </div>
</template>
