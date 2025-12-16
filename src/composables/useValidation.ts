// src/composables/useValidation.ts
import { ref, computed } from "vue";

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
  error: string;
  touched: boolean;
}

export function useValidation() {
  const fields = ref<Record<string, FieldValidation>>({});

  // Validation rules
  const rules = {
    required: (message = "Este campo es obligatorio"): ValidationRule => ({
      validate: (value: any) => {
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined;
      },
      message,
    }),

    email: (message = "Debe ser un email válido"): ValidationRule => ({
      validate: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value);
      },
      message,
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      validate: (value: string) => !value || value.length >= min,
      message: message || `Debe tener al menos ${min} caracteres`,
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      validate: (value: string) => !value || value.length <= max,
      message: message || `No puede exceder ${max} caracteres`,
    }),

    min: (min: number, message?: string): ValidationRule => ({
      validate: (value: number) =>
        value === null || value === undefined || value >= min,
      message: message || `El valor mínimo es ${min}`,
    }),

    max: (max: number, message?: string): ValidationRule => ({
      validate: (value: number) =>
        value === null || value === undefined || value <= max,
      message: message || `El valor máximo es ${max}`,
    }),

    pattern: (regex: RegExp, message = "Formato inválido"): ValidationRule => ({
      validate: (value: string) => !value || regex.test(value),
      message,
    }),

    alphanumeric: (
      message = "Solo se permiten caracteres alfanuméricos"
    ): ValidationRule => ({
      validate: (value: string) => !value || /^[a-zA-Z0-9]+$/.test(value),
      message,
    }),

    match: (
      otherField: string,
      message = "Los campos no coinciden"
    ): ValidationRule => ({
      validate: (value: string) => {
        const other = fields.value[otherField];
        return !value || !other || value === other.value;
      },
      message,
    }),

    url: (message = "Debe ser una URL válida"): ValidationRule => ({
      validate: (value: string) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message,
    }),

    date: (message = "Debe ser una fecha válida"): ValidationRule => ({
      validate: (value: string) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      message,
    }),

    integer: (message = "Debe ser un número entero"): ValidationRule => ({
      validate: (value: any) => {
        if (value === null || value === undefined || value === "") return true;
        return Number.isInteger(Number(value));
      },
      message,
    }),

    positive: (message = "Debe ser un número positivo"): ValidationRule => ({
      validate: (value: number) => {
        if (value === null || value === undefined) return true;
        return Number(value) > 0;
      },
      message,
    }),
  };

  // Register a field with validation rules
  const registerField = (
    name: string,
    initialValue: any = "",
    validationRules: ValidationRule[] = []
  ) => {
    fields.value[name] = {
      value: initialValue,
      rules: validationRules,
      error: "",
      touched: false,
    };
  };

  // Validate a single field
  const validateField = (name: string): boolean => {
    const field = fields.value[name];
    if (!field) return true;

    field.touched = true;

    for (const rule of field.rules) {
      if (!rule.validate(field.value)) {
        field.error = rule.message;
        return false;
      }
    }

    field.error = "";
    return true;
  };

  // Validate all fields
  const validateAll = (): boolean => {
    let isValid = true;

    for (const name in fields.value) {
      if (!validateField(name)) {
        isValid = false;
      }
    }

    return isValid;
  };

  // Reset all fields
  const reset = () => {
    for (const name in fields.value) {
      const field = fields.value[name];
      if (field) {
        field.error = "";
        field.touched = false;
      }
    }
  };

  // Clear all fields
  const clear = () => {
    fields.value = {};
  };

  // Get field error
  const getError = (name: string): string => {
    return fields.value[name]?.error || "";
  };

  // Check if field has error
  const hasError = (name: string): boolean => {
    const field = fields.value[name];
    return field ? field.touched && field.error.length > 0 : false;
  };

  // Check if form is valid
  const isValid = computed(() => {
    return Object.values(fields.value).every((field) => !field.error);
  });

  // Check if any field is touched
  const isTouched = computed(() => {
    return Object.values(fields.value).some((field) => field.touched);
  });

  return {
    fields,
    rules,
    registerField,
    validateField,
    validateAll,
    reset,
    clear,
    getError,
    hasError,
    isValid,
    isTouched,
  };
}
