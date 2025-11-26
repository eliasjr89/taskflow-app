import { ref, watch } from "vue";

export function useTheme() {
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

  watch(
    isDark,
    (newVal) => {
      localStorage.setItem("theme", newVal ? "dark" : "light");
      applyTheme();
    },
    { immediate: true }
  );

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggleTheme };
}
