<template>
  <aside
    class="hidden md:flex flex-col w-64 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-lg gap-3">
    <input
      type="text"
      placeholder="Buscar tareas..."
      class="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />

    <button
      class="p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-700 transition text-left w-full">
      All
    </button>
    <button
      class="p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-700 transition text-left w-full">
      Pending
    </button>
    <button
      class="p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-700 transition text-left w-full">
      Completed
    </button>
  </aside>
</template>
