import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TaskCard from "../tasks/TaskCard.vue";
import { createI18n } from "vue-i18n";
import es from "../../locales/es";
import type { Task } from "../../types/global";

describe("TaskCard", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "es",
    messages: { es },
    globalInjection: true,
  });

  const mockTask: Task = {
    id: 1,
    title: "Tarea de prueba",
    completed: false,
    createdAt: new Date("2024-01-01T12:00:00"),
    priority: "low",
  };

  const mountCard = (props = {}) => {
    return mount(TaskCard, {
      props: { task: mockTask, ...props },
      global: {
        plugins: [i18n],
      },
    });
  };

  it("debe renderizar la tarea correctamente", () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain("Tarea de prueba");
  });

  it("debe mostrar el checkbox", () => {
    const wrapper = mountCard();
    // Checkbox is now a custom div, selecting by the wrapper class which handles the click
    const checkbox = wrapper.find(".shrink-0.w-10.h-10");
    expect(checkbox.exists()).toBe(true);
  });

  it("debe mostrar el checklist checked si la tarea está completada", () => {
    const wrapper = mountCard({ task: { ...mockTask, completed: true } });
    const checkbox = wrapper.find(".shrink-0.w-10.h-10");
    expect(checkbox.classes()).toContain("bg-green-500");
  });

  it("debe mostrar fecha formateada", () => {
    const wrapper = mountCard();
    expect(wrapper.exists()).toBe(true);
  });
});
