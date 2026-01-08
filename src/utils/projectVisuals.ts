import {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Book,
  Camera,
  Bell,
  Gift,
  Globe,
  Home,
  Music,
} from "lucide-vue-next";
import type { Component } from "vue";

export const PROJECT_ICONS: Record<string, Component> = {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Music,
  Book,
  Camera,
  Bell,
  Gift,
  Globe,
  Home,
};

export const getProjectColorClass = (color?: string) => {
  const colors: Record<string, string> = {
    indigo: "text-indigo-500",
    purple: "text-purple-500",
    pink: "text-pink-500",
    rose: "text-rose-500",
    orange: "text-orange-500",
    amber: "text-amber-500",
    green: "text-green-500",
    teal: "text-teal-500",
    cyan: "text-cyan-600",
    blue: "text-blue-500",
    lime: "text-lime-500",
    emerald: "text-emerald-500",
    fuchsia: "text-fuchsia-500",
    sky: "text-sky-500",
    violet: "text-violet-500",
  };
  return colors[color || "indigo"] || "text-gray-400";
};

export const getProjectBgColorClass = (color?: string) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
    lime: "bg-lime-500",
    emerald: "bg-emerald-500",
    fuchsia: "bg-fuchsia-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
  };
  return colors[color || "indigo"] || "bg-gray-400";
};
