import { computed } from "vue";
import { useRoute } from "vue-router";

export function useSectionTheme() {
  const route = useRoute();

  const theme = computed(() => {
    const path = route.path;

    // 1. Dashboard (`/`)
    // Dark: Indigo/Violet
    // Light: Amber/Orange
    if (path === "/" || path === "/dashboard") {
      return {
        name: "dashboard",
        gradients: {
          blob1:
            "from-amber-200 via-orange-100 to-yellow-200 dark:from-indigo-900 dark:via-purple-900 dark:to-violet-900",
          blob2:
            "from-yellow-200 via-red-100 to-orange-200 dark:from-violet-900 dark:via-fuchsia-900 dark:to-purple-900",
          blob3:
            "from-orange-200 via-yellow-100 to-amber-200 dark:from-purple-800 dark:via-indigo-800 dark:to-violet-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-amber-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600 text-white shadow-lg shadow-orange-500/30 dark:shadow-indigo-500/30",
          icon: "text-amber-600 dark:text-indigo-400",
        },
      };
    }

    // 2. Tasks (`/tasks`)
    // Dark: Emerald/Teal
    // Light: Rose/Pink
    if (path.includes("/tasks")) {
      return {
        name: "tasks",
        gradients: {
          blob1:
            "from-rose-200 via-pink-100 to-red-200 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900",
          blob2:
            "from-pink-200 via-rose-100 to-fuchsia-200 dark:from-teal-900 dark:via-cyan-900 dark:to-emerald-900",
          blob3:
            "from-red-200 via-orange-100 to-pink-200 dark:from-green-800 dark:via-emerald-800 dark:to-teal-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-rose-500 to-pink-500 dark:from-emerald-600 dark:to-teal-600 text-white shadow-lg shadow-rose-500/30 dark:shadow-emerald-500/30",
          icon: "text-rose-600 dark:text-emerald-400",
        },
      };
    }

    // 3. Projects (`/projects`)
    // Dark: Blue/Indigo
    // Light: Orange/Amber
    if (path.includes("/projects")) {
      return {
        name: "projects",
        gradients: {
          blob1:
            "from-orange-200 via-amber-100 to-yellow-200 dark:from-blue-900 dark:via-indigo-900 dark:to-sky-900",
          blob2:
            "from-amber-200 via-yellow-100 to-orange-200 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900",
          blob3:
            "from-yellow-200 via-orange-100 to-amber-200 dark:from-sky-800 dark:via-blue-800 dark:to-indigo-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-orange-500 to-amber-500 dark:from-blue-600 dark:to-indigo-600 text-white shadow-lg shadow-orange-500/30 dark:shadow-blue-500/30",
          icon: "text-orange-600 dark:text-blue-400",
        },
      };
    }

    // 4. Calendar (`/calendar`)
    // Dark: Rose/Red
    // Light: Emerald/Mint
    if (path.includes("/calendar")) {
      return {
        name: "calendar",
        gradients: {
          blob1:
            "from-emerald-200 via-green-100 to-teal-200 dark:from-rose-900 dark:via-red-900 dark:to-pink-900",
          blob2:
            "from-teal-200 via-emerald-100 to-cyan-200 dark:from-red-900 dark:via-rose-900 dark:to-orange-900",
          blob3:
            "from-green-200 via-teal-100 to-emerald-200 dark:from-pink-800 dark:via-red-800 dark:to-rose-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-emerald-500 to-teal-500 dark:from-rose-600 dark:to-red-600 text-white shadow-lg shadow-emerald-500/30 dark:shadow-rose-500/30",
          icon: "text-emerald-600 dark:text-rose-400",
        },
      };
    }

    // 5. Tags (`/tags`)
    // Dark: Fuchsia/Pink
    // Light: Lime/Yellow
    if (path.includes("/tags")) {
      return {
        name: "tags",
        gradients: {
          blob1:
            "from-lime-200 via-green-100 to-emerald-200 dark:from-fuchsia-900 dark:via-pink-900 dark:to-purple-900",
          blob2:
            "from-green-200 via-lime-100 to-teal-200 dark:from-pink-900 dark:via-rose-900 dark:to-fuchsia-900",
          blob3:
            "from-yellow-200 via-lime-100 to-green-200 dark:from-purple-800 dark:via-fuchsia-800 dark:to-pink-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-lime-500 to-green-500 dark:from-fuchsia-600 dark:to-pink-600 text-white shadow-lg shadow-lime-500/30 dark:shadow-fuchsia-500/30",
          icon: "text-lime-600 dark:text-fuchsia-400",
        },
      };
    }

    // 6. Analytics (`/analytics`)
    // Dark: Cyan/Sky
    // Light: Coral/Red
    if (path.includes("/analytics")) {
      return {
        name: "analytics",
        gradients: {
          blob1:
            "from-orange-200 via-red-100 to-rose-200 dark:from-cyan-900 dark:via-sky-900 dark:to-blue-900",
          blob2:
            "from-red-200 via-rose-100 to-pink-200 dark:from-sky-900 dark:via-blue-900 dark:to-indigo-900",
          blob3:
            "from-rose-200 via-orange-100 to-red-200 dark:from-blue-800 dark:via-cyan-800 dark:to-sky-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-red-500 to-rose-500 dark:from-cyan-600 dark:to-sky-600 text-white shadow-lg shadow-red-500/30 dark:shadow-cyan-500/30",
          icon: "text-red-600 dark:text-cyan-400",
        },
      };
    }

    // 7. Profile (`/profile`)
    // Dark: Orange/Amber
    // Light: Blue/Sky
    if (path.includes("/profile")) {
      return {
        name: "profile",
        gradients: {
          blob1:
            "from-sky-200 via-blue-100 to-indigo-200 dark:from-orange-900 dark:via-amber-900 dark:to-red-900",
          blob2:
            "from-blue-200 via-indigo-100 to-violet-200 dark:from-amber-900 dark:via-orange-900 dark:to-yellow-900",
          blob3:
            "from-indigo-200 via-sky-100 to-blue-200 dark:from-red-800 dark:via-orange-800 dark:to-amber-800",
        },
        sidebar: {
          active:
            "bg-gradient-to-r from-sky-500 to-blue-500 dark:from-orange-600 dark:to-amber-600 text-white shadow-lg shadow-sky-500/30 dark:shadow-orange-500/30",
          icon: "text-sky-600 dark:text-orange-400",
        },
      };
    }
    // 8. Auth (Login/Exit)
    if (path.includes("/login") || path.includes("/exit")) {
      return {
        name: "auth",
        gradients: {
          blob1:
            "from-blue-200 via-indigo-100 to-violet-200 dark:from-blue-900 dark:via-indigo-900 dark:to-violet-900",
          blob2:
            "from-indigo-200 via-blue-100 to-sky-200 dark:from-indigo-900 dark:via-blue-900 dark:to-sky-900",
          blob3:
            "from-violet-200 via-indigo-100 to-blue-200 dark:from-violet-800 dark:via-indigo-800 dark:to-blue-800",
        },
        sidebar: {
          active: "",
          icon: "",
        },
      };
    }

    // Default Fallback (Dashboard)
    return {
      name: "default",
      gradients: {
        blob1:
          "from-amber-200 via-orange-100 to-yellow-200 dark:from-indigo-900 dark:via-purple-900 dark:to-violet-900",
        blob2:
          "from-yellow-200 via-red-100 to-orange-200 dark:from-violet-900 dark:via-fuchsia-900 dark:to-purple-900",
        blob3:
          "from-orange-200 via-yellow-100 to-amber-200 dark:from-purple-800 dark:via-indigo-800 dark:to-violet-800",
      },
      sidebar: {
        active:
          "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-indigo-600 dark:to-purple-600 text-white shadow-lg shadow-orange-500/30 dark:shadow-indigo-500/30",
        icon: "text-amber-600 dark:text-indigo-400",
      },
    };
  });

  return { theme };
}
