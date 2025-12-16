import { computed } from "vue";
import { useRoute } from "vue-router";

export function useSectionTheme() {
  const route = useRoute();

  const theme = computed(() => {
    const path = route.path;

    // 1. Dashboard (`/`)
    // Dark: Indigo/Violet
    // Light: Amber/Orange
    // 1. Dashboard / Overview (`/` or `/admin` or `/admin/overview`)
    // Color: Indigo/Violet (Consistent)
    if (
      path === "/" ||
      path === "/dashboard" ||
      path === "/admin" ||
      path.includes("/admin/overview")
    ) {
      return {
        name: "dashboard",
        gradients: {
          blob1:
            "from-indigo-200 via-purple-100 to-violet-200 dark:from-indigo-900 dark:via-purple-900 dark:to-violet-900",
          blob2:
            "from-violet-200 via-fuchsia-100 to-purple-200 dark:from-violet-900 dark:via-fuchsia-900 dark:to-purple-900",
          blob3:
            "from-purple-200 via-indigo-100 to-violet-200 dark:from-purple-800 dark:via-indigo-800 dark:to-violet-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-indigo-500 to-violet-500 dark:from-indigo-600 dark:to-purple-600 text-white shadow-lg shadow-indigo-500/30",
          icon: "text-indigo-600 dark:text-indigo-400",
        },
      };
    }

    // 1.1 Admin Users (`/admin/users`) --> Cyan/Teal
    if (path.includes("/admin/users")) {
      return {
        name: "admin-users",
        gradients: {
          blob1:
            "from-cyan-200 via-teal-100 to-emerald-200 dark:from-cyan-900 dark:via-teal-900 dark:to-emerald-900",
          blob2:
            "from-teal-200 via-cyan-100 to-emerald-200 dark:from-teal-900 dark:via-emerald-900 dark:to-green-900",
          blob3:
            "from-emerald-200 via-teal-100 to-cyan-200 dark:from-emerald-900 dark:via-cyan-900 dark:to-teal-900",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-cyan-500 to-teal-500 dark:from-cyan-600 dark:to-teal-600 text-white shadow-lg shadow-cyan-500/30",
          icon: "text-cyan-600 dark:text-cyan-400",
        },
      };
    }

    // 1.2 Admin Database (`/admin/database`) --> Rose/Red
    if (path.includes("/admin/database")) {
      return {
        name: "admin-database",
        gradients: {
          blob1:
            "from-rose-200 via-red-100 to-orange-200 dark:from-rose-900 dark:via-red-900 dark:to-orange-900",
          blob2:
            "from-red-200 via-rose-100 to-pink-200 dark:from-red-900 dark:via-orange-900 dark:to-amber-900",
          blob3:
            "from-orange-200 via-red-100 to-rose-200 dark:from-orange-900 dark:via-rose-900 dark:to-red-900",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-rose-500 to-red-500 dark:from-rose-600 dark:to-red-600 text-white shadow-lg shadow-rose-500/30",
          icon: "text-rose-600 dark:text-rose-400",
        },
      };
    }

    // 2. Tasks (`/tasks`) --> Pink/Fuchsia (Consistent)
    if (path.includes("/tasks")) {
      return {
        name: "tasks",
        gradients: {
          blob1:
            "from-pink-200 via-rose-100 to-fuchsia-200 dark:from-pink-900 dark:via-rose-900 dark:to-fuchsia-900",
          blob2:
            "from-rose-200 via-pink-100 to-red-200 dark:from-rose-900 dark:via-pink-900 dark:to-red-900",
          blob3:
            "from-fuchsia-200 via-pink-100 to-purple-200 dark:from-fuchsia-800 dark:via-purple-800 dark:to-pink-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600 text-white shadow-lg shadow-pink-500/30",
          icon: "text-pink-600 dark:text-pink-400",
        },
      };
    }

    // 3. Projects (`/projects`) --> Blue/Sky (Consistent)
    if (path.includes("/projects")) {
      return {
        name: "projects",
        gradients: {
          blob1:
            "from-blue-200 via-sky-100 to-indigo-200 dark:from-blue-900 dark:via-indigo-900 dark:to-sky-900",
          blob2:
            "from-sky-200 via-blue-100 to-cyan-200 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900",
          blob3:
            "from-indigo-200 via-blue-100 to-sky-200 dark:from-sky-800 dark:via-blue-800 dark:to-indigo-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-blue-500 to-sky-500 dark:from-blue-600 dark:to-sky-600 text-white shadow-lg shadow-blue-500/30",
          icon: "text-blue-600 dark:text-blue-400",
        },
      };
    }

    // 4. Calendar (`/calendar`) --> Emerald/Teal (Consistent with Green vibe)
    if (path.includes("/calendar")) {
      return {
        name: "calendar",
        gradients: {
          blob1:
            "from-emerald-200 via-green-100 to-teal-200 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900",
          blob2:
            "from-teal-200 via-emerald-100 to-cyan-200 dark:from-teal-900 dark:via-emerald-900 dark:to-cyan-900",
          blob3:
            "from-green-200 via-teal-100 to-emerald-200 dark:from-green-800 dark:via-teal-800 dark:to-emerald-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white shadow-lg shadow-emerald-500/30",
          icon: "text-emerald-600 dark:text-emerald-400",
        },
      };
    }

    // 5. Tags (`/tags`) --> Violet/Purple (Consistent)
    if (path.includes("/tags")) {
      return {
        name: "tags",
        gradients: {
          blob1:
            "from-violet-200 via-purple-100 to-fuchsia-200 dark:from-violet-900 dark:via-purple-900 dark:to-fuchsia-900",
          blob2:
            "from-purple-200 via-violet-100 to-indigo-200 dark:from-purple-900 dark:via-violet-900 dark:to-indigo-900",
          blob3:
            "from-fuchsia-200 via-purple-100 to-violet-200 dark:from-fuchsia-800 dark:via-purple-800 dark:to-violet-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-violet-500 to-purple-500 dark:from-violet-600 dark:to-purple-600 text-white shadow-lg shadow-violet-500/30",
          icon: "text-violet-600 dark:text-violet-400",
        },
      };
    }

    // 6. Analytics (`/analytics`) --> Fuchsia/Pink (Distinct from Tasks/Profile/Dashboard)
    if (path.includes("/analytics")) {
      return {
        name: "analytics",
        gradients: {
          blob1:
            "from-fuchsia-200 via-pink-100 to-purple-200 dark:from-fuchsia-900 dark:via-pink-900 dark:to-purple-900",
          blob2:
            "from-purple-200 via-fuchsia-100 to-pink-200 dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-900",
          blob3:
            "from-pink-200 via-purple-100 to-fuchsia-200 dark:from-pink-800 dark:via-purple-800 dark:to-fuchsia-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-fuchsia-500 to-purple-500 dark:from-fuchsia-600 dark:to-purple-600 text-white shadow-lg shadow-fuchsia-500/30",
          icon: "text-fuchsia-600 dark:text-fuchsia-400",
        },
      };
    }

    // 7. Profile (`/profile`) --> Orange/Amber (Requested)
    if (path.includes("/profile")) {
      return {
        name: "profile",
        gradients: {
          blob1:
            "from-orange-200 via-amber-100 to-yellow-200 dark:from-orange-900 dark:via-amber-900 dark:to-yellow-900",
          blob2:
            "from-amber-200 via-orange-100 to-red-200 dark:from-amber-900 dark:via-orange-900 dark:to-red-900",
          blob3:
            "from-yellow-200 via-amber-100 to-orange-200 dark:from-yellow-800 dark:via-amber-800 dark:to-orange-800",
        },
        sidebar: {
          active:
            "bg-linear-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 text-white shadow-lg shadow-orange-500/30",
          icon: "text-orange-600 dark:text-orange-400 inline-block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent",
        },
      };
    }

    // 8. Auth
    if (path.includes("/login") || path.includes("/exit")) {
      return {
        name: "auth",
        gradients: {
          blob1:
            "from-indigo-200 via-blue-100 to-violet-200 dark:from-indigo-900 dark:via-blue-900 dark:to-violet-900",
          blob2:
            "from-blue-200 via-indigo-100 to-sky-200 dark:from-blue-900 dark:via-indigo-900 dark:to-sky-900",
          blob3:
            "from-violet-200 via-indigo-100 to-blue-200 dark:from-violet-800 dark:via-indigo-800 dark:to-blue-800",
        },
        sidebar: {
          active: "bg-indigo-600 text-white",
          icon: "text-indigo-600",
        },
      };
    }

    // Default Fallback (Dashboard - Indigo)
    return {
      name: "default",
      gradients: {
        blob1:
          "from-indigo-200 via-purple-100 to-violet-200 dark:from-indigo-900 dark:via-purple-900 dark:to-violet-900",
        blob2:
          "from-violet-200 via-fuchsia-100 to-purple-200 dark:from-violet-900 dark:via-fuchsia-900 dark:to-purple-900",
        blob3:
          "from-purple-200 via-indigo-100 to-violet-200 dark:from-purple-800 dark:via-indigo-800 dark:to-violet-800",
      },
      sidebar: {
        active:
          "bg-linear-to-r from-indigo-500 to-violet-500 dark:from-indigo-600 dark:to-purple-600 text-white shadow-lg shadow-indigo-500/30",
        icon: "text-indigo-600 dark:text-indigo-400",
      },
    };
  });

  return { theme };
}
