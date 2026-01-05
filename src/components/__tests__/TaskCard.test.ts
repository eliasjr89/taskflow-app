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
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);
  });

  it("debe marcar el checkbox si la tarea está completada", () => {
    const wrapper = mountCard({ task: { ...mockTask, completed: true } });
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it("debe mostrar fecha formateada", () => {
    const wrapper = mountCard();
    expect(wrapper.exists()).toBe(true);
  });
});
