import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AddTagModal from "../tags/AddTagModal.vue";

import { createI18n } from "vue-i18n";
import es from "../../locales/es";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
  globalInjection: true,
});

describe("AddTagModal", () => {
  const mountModal = (props = {}) => {
    return mount(AddTagModal, {
      props: {
        isOpen: true,
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Teleport: true,
        },
      },
    });
  };

  it("debe renderizar el modal cuando isOpen es true", () => {
    const wrapper = mountModal();
    expect(wrapper.find(".fixed").exists()).toBe(true);
  });

  it("debe mostrar título correcto", () => {
    const wrapper = mountModal();
    expect(wrapper.text()).toContain(es.tags.new_tag);
  });

  it("debe emitir close", async () => {
    const wrapper = mountModal();
    wrapper.vm.$emit("close");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("debe emitir save con datos", async () => {
    const wrapper = mountModal();
    const newTag = { name: "Test", color: "blue" };
    wrapper.vm.$emit("save", newTag);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("save")).toBeTruthy();
    expect(wrapper.emitted("save")?.[0]?.[0]).toEqual(newTag);
  });
});
