import { ref, watch } from "vue";

const isDark = ref(
  localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const initTheme = () => {
  applyTheme();
};

watch(isDark, (newVal) => {
  localStorage.setItem("theme", newVal ? "dark" : "light");
  applyTheme();
});

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggleTheme };
}
