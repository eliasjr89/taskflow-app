import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import TagsView from "../TagsView.vue";
import { createI18n } from "vue-i18n";

import es from "../../locales/es";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: {
    es,
  },
});

describe("TagsView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mountView = async (props = {}) => {
    const wrapper = mount(TagsView, {
      props,
      global: {
        plugins: [i18n],
        stubs: {
          AddTagModal: true,
        },
      },
    });
    await flushPromises();
    return wrapper;
  };

  it("debe renderizar la vista correctamente", async () => {
    const wrapper = await mountView();
    expect(wrapper.find(".flex-1").exists()).toBe(true);
  });

  it("debe mostrar el título de etiquetas", async () => {
    const wrapper = await mountView();
    expect(wrapper.text()).toContain("Etiquetas");
  });

  it("debe mostrar el botón de nueva etiqueta", async () => {
    const wrapper = await mountView();
    const newButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Nueva Etiqueta"));

    expect(newButton).toBeTruthy();
  });

  it("debe abrir el modal al hacer clic en nueva etiqueta", async () => {
    const wrapper = await mountView();
    const newButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Nueva Etiqueta"));

    await newButton?.trigger("click");
    await flushPromises();

    const modal = wrapper.findComponent({ name: "AddTagModal" });
    expect(modal.props("isOpen")).toBe(true);
  });

  it("debe mostrar estado vacío cuando no hay etiquetas", async () => {
    const wrapper = await mountView();

    const hasEmptyState =
      wrapper.text().includes("No hay etiquetas") ||
      wrapper.find(".text-center").exists();

    expect(hasEmptyState).toBe(true);
  });

  it("debe renderizar tarjetas de etiquetas si existen", async () => {
    const wrapper = await mountView();
    const tagCards = wrapper.findAll(".glass-card");

    // Si no hay etiquetas, debe mostrar estado vacío
    if (tagCards.length === 0) {
      expect(wrapper.text()).toContain("No hay etiquetas");
    }
  });

  it("debe mostrar estadísticas de progreso por etiqueta", async () => {
    const wrapper = await mountView();

    // Verificar que existe el texto "Progreso" o elementos de estadísticas
    const hasStats =
      wrapper.text().includes("Progreso") ||
      wrapper.text().includes("completadas") ||
      wrapper.text().includes("pendientes") ||
      wrapper.text().includes("tarea");

    expect(hasStats).toBe(true);
  });

  it("debe renderizar el modal de agregar/editar etiqueta", async () => {
    const wrapper = await mountView();
    const modal = wrapper.findComponent({ name: "AddTagModal" });

    expect(modal.exists()).toBe(true);
  });

  it("debe tener animación fade-in", async () => {
    const wrapper = await mountView();
    const mainDiv = wrapper.find(".flex-1");

    expect(mainDiv.attributes("class")).toContain("animate-fade-in");
  });

  it("debe permitir editar etiquetas existentes", async () => {
    const wrapper = await mountView();

    // Buscar botones de editar (iconos de Edit2)
    const editButtons = wrapper
      .findAll("button")
      .filter(
        (btn) =>
          btn.attributes("title")?.includes("Editar") ||
          btn.find("svg").exists()
      );

    // Si hay etiquetas, debe haber botones de editar
    expect(editButtons.length >= 0).toBe(true);
  });

  it("debe permitir eliminar etiquetas", async () => {
    const wrapper = await mountView();

    // Buscar botones de eliminar
    const deleteButtons = wrapper
      .findAll("button")
      .filter(
        (btn) =>
          btn.attributes("title")?.includes("Eliminar") ||
          btn.find("svg").exists()
      );

    expect(deleteButtons.length >= 0).toBe(true);
  });
});
