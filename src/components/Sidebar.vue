<script setup lang="ts">
import { ref } from "vue";

// Mantiene el filtro activo (solo para estilos visuales)
const active = ref<"all" | "pending" | "completed">("all");

// Emitimos al padre cuando se seleccione un filtro
const emit = defineEmits<{
  (e: "filter", value: "all" | "pending" | "completed"): void;
}>();

function selectFilter(value: "all" | "pending" | "completed") {
  active.value = value;
  emit("filter", value);
}
</script>

<template>
  <aside
    class="hidden md:flex flex-col w-64 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-lg gap-3">
    <!-- Buscador -->
    <input
      type="text"
      placeholder="Buscar tareas..."
      class="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />

    <!-- Botones de filtro -->
    <button
      @click="selectFilter('all')"
      :class="[
        'p-2 rounded transition text-left w-full cursor-pointer',
        active === 'all'
          ? 'bg-indigo-500 text-white'
          : 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      ]">
      Todas
    </button>

    <button
      @click="selectFilter('pending')"
      :class="[
        'p-2 rounded transition text-left w-full cursor-pointer',
        active === 'pending'
          ? 'bg-indigo-500 text-white'
          : 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      ]">
      Pendientes
    </button>

    <button
      @click="selectFilter('completed')"
      :class="[
        'p-2 rounded transition text-left w-full cursor-pointer',
        active === 'completed'
          ? 'bg-indigo-500 text-white'
          : 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      ]">
      Completadas
    </button>
  </aside>
</template>
