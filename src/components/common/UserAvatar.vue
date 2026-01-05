<script setup lang="ts">
import { ref } from "vue";
import type { User } from "@/types";

interface Props {
  user: User;
  size?: string; // e.g., "w-8 h-8"
  fontSize?: string; // e.g., "text-[10px]"
}

const props = withDefaults(defineProps<Props>(), {
  size: "w-8 h-8",
  fontSize: "text-[10px]",
});

const showTooltip = ref(false);
const tooltipAlign = ref<"left" | "center" | "right">("center");
const containerRef = ref<HTMLElement | null>(null);

const handleMouseEnter = () => {
  showTooltip.value = true;
  calculateAlignment();
};

const calculateAlignment = () => {
  if (!containerRef.value || !containerRef.value.offsetParent) return;

  const parent = containerRef.value.offsetParent as HTMLElement;
  const parentWidth = parent.offsetWidth;
  const myLeft = containerRef.value.offsetLeft;
  const myWidth = containerRef.value.offsetWidth;

  // Threshold: if within 80px of left edge -> align left
  // if within 80px of right edge -> align right
  if (myLeft < 80) {
    tooltipAlign.value = "left";
  } else if (myLeft + myWidth > parentWidth - 80) {
    tooltipAlign.value = "right";
  } else {
    tooltipAlign.value = "center";
  }
};
</script>

<template>
  <div
    ref="containerRef"
    class="relative group z-0 hover:z-20 shrink-0"
    @mouseenter="handleMouseEnter"
    @mouseleave="showTooltip = false"
    @click="showTooltip = !showTooltip">
    <!-- Helper div for hover bridge if needed, but group-hover usually works -->

    <!-- Main Avatar Circle -->
    <div
      :class="[
        props.size,
        props.fontSize,
        'rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-110',
      ]">
      <img
        v-if="user.profile_image"
        :src="user.profile_image"
        class="w-full h-full rounded-full object-cover"
        :alt="user.username" />
      <span v-else>{{ user.username?.charAt(0).toUpperCase() }}</span>
    </div>

    <!-- Tooltip -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95">
      <div
        v-if="showTooltip"
        class="absolute bottom-full mb-3 w-max pointer-events-none z-50"
        :class="{
          'left-1/2 -translate-x-1/2': tooltipAlign === 'center',
          'left-0': tooltipAlign === 'left',
          'right-0': tooltipAlign === 'right',
        }">
        <!-- Tooltip Content: Circular Aesthetic -->
        <div class="flex flex-col items-center">
          <!-- The 'Circular Form' - A nicely styled bubble containing image and name -->
          <div
            class="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 text-white p-3 rounded-2xl shadow-xl flex flex-col items-center gap-2 min-w-[100px]">
            <div
              class="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-lg overflow-hidden">
              <img
                v-if="user.profile_image"
                :src="user.profile_image"
                class="w-full h-full object-cover"
                :alt="user.username" />
              <div
                v-else
                class="w-full h-full bg-slate-700 flex items-center justify-center font-bold">
                {{ user.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="text-center">
              <p class="font-bold text-xs">
                {{ user.name }} {{ user.lastname }}
              </p>
              <p class="text-[10px] text-indigo-300">@{{ user.username }}</p>
            </div>
          </div>

          <!-- Arrow/Triangle -->
          <!-- Adjust arrow position based on alignment if needed, or keep centered relative to the bubble's self centering?
               If align is left, the bubble starts at left-0. The arrow should be centered on the avatar.
               Avatar is width w-8 (32px). Center is 16px.
               If tooltip is 'left-0', it starts at 0.
               We need to move the arrow to match the avatar center.
          -->
          <div
            class="w-3 h-3 bg-slate-900/90 border-r border-b border-indigo-500/30 rotate-45 -mt-1.5 shadow-sm absolute -bottom-1.5"
            :class="{
              'left-1/2 -translate-x-1/2': tooltipAlign === 'center',
              'left-4': tooltipAlign === 'left',
              'right-4': tooltipAlign === 'right',
            }"></div>
        </div>
      </div>
    </transition>
  </div>
</template>
