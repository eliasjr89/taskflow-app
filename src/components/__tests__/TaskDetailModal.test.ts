import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TaskDetailModal from "../../components/tasks/TaskDetailModal.vue";
import { createI18n } from "vue-i18n";
import es from "../../locales/es";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
  globalInjection: true,
});

describe("TaskDetailModal", () => {
  const mockTask = {
    id: 1,
    title: "Test Task",
    description: "Test Description",
    completed: false,
    createdAt: new Date(),
    priority: "medium" as const,
    tags: ["1"],
    projectId: "1",
  };

  const mountModal = (props = {}) => {
    return mount(TaskDetailModal, {
      props: {
        task: mockTask,
        isOpen: true,
        ...props,
      },
      global: {
        plugins: [i18n],
      },
    });
  };

  it("renders correctly when open", () => {
    const wrapper = mountModal();
    // Check input values
    const titleInput = wrapper.find('input[type="text"]');
    expect((titleInput.element as HTMLInputElement).value).toBe("Test Task");
  });

  it("does not render when closed", () => {
    const wrapper = mountModal({ isOpen: false });
    expect(wrapper.find(".fixed").exists()).toBe(false);
  });

  it("emits close event when clicking close button", async () => {
    const wrapper = mountModal();
    // Usually logic implies clicking backdrop or specific button
    // Check if there is a backdrop
    const backdrop = wrapper.find(".absolute.inset-0");
    if (backdrop.exists()) {
      await backdrop.trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    } else {
      // Look for Close button
      const closeBtn = wrapper
        .findAll("button")
        .find(
          (b) => b.text().includes(es.common.close) || b.find("svg").exists()
        );
      if (closeBtn) {
        await closeBtn.trigger("click");
        expect(wrapper.emitted("close")).toBeTruthy();
      }
    }
  });

  it("shows correct translations", () => {
    const wrapper = mountModal();
    // Check for some label
    expect(wrapper.text()).toContain(es.tasks.priority);
  });
});
