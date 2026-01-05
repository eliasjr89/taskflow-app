<template>
  <div class="container mx-auto px-4 py-8">
    <div
      class="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {{ $t("about.title", "About Us") }}
      </h1>
      <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
        {{
          $t(
            "about.description",
            "TaskFlow is a productivity management tool designed to help you organize your daily activities efficiently."
          )
        }}
      </p>
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {{ $t("about.mission_title", "Our Mission") }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{
            $t(
              "about.mission_text",
              "To provide a simple yet powerful platform for individuals and teams to achieve more."
            )
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Basic setup
</script>
