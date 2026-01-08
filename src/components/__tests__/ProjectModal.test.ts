import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectModal from "../projects/ProjectModal.vue";
import { createI18n } from "vue-i18n";
import es from "../../locales/es";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
  globalInjection: true,
});

describe("AddProjectModal", () => {
  const mountModal = (props = {}) => {
    return mount(ProjectModal, {
      props: {
        isOpen: true,
        ...props,
      },
      global: {
        plugins: [i18n],
      },
    });
  };

  it("debe renderizar el modal cuando isOpen es true", () => {
    const wrapper = mountModal();
    expect(wrapper.find(".fixed").exists()).toBe(true);
  });

  it("no debe renderizar el modal cuando isOpen es false", () => {
    const wrapper = mountModal({ isOpen: false });
    expect(wrapper.find(".fixed").exists()).toBe(false);
  });

  it("debe mostrar el título correcto", () => {
    const wrapper = mountModal();
    expect(wrapper.text()).toContain(es.projects.new_project);
  });

  it("debe emitir evento close al hacer clic en cancelar", async () => {
    const wrapper = mountModal();
    const cancelButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes(es.common.cancel)); // Use actual text from ES

    await cancelButton?.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("debe emitir evento create con los datos correctos", async () => {
    const wrapper = mountModal();
    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue("Mi Proyecto");

    const createButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes(es.common.create));

    await createButton?.trigger("click");

    const emitted = wrapper.emitted("create");
    expect(emitted).toBeTruthy();
    if (emitted) {
      expect(emitted[0]![0]).toMatchObject({
        title: "Mi Proyecto",
      });
    }
  });
});
