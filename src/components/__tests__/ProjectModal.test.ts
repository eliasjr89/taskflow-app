import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectModal from "../ProjectModal.vue";
import { createI18n } from "vue-i18n";

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: {
    es: {
      projects: {
        new_project: "Nuevo Proyecto",
        edit_project: "Editar Proyecto",
        project_name: "Nombre del proyecto",
        description_optional: "Descripción (Opcional)",
        description_placeholder: "Breve descripción...",
        color: "Color",
        icon: "Icono",
      },
      common: {
        cancel: "Cancelar",
        create: "Crear",
        save: "Guardar",
      },
    },
  },
});

// Crypto mock removed for TS compatibility

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

  it('debe mostrar el título "Nuevo Proyecto" en modo creación', () => {
    const wrapper = mountModal();
    expect(wrapper.text()).toContain("Nuevo Proyecto");
  });

  it("debe emitir evento close al hacer clic en cancelar", async () => {
    const wrapper = mountModal();
    const cancelButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Cancelar"));

    await cancelButton?.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("debe emitir evento close al hacer clic en el backdrop", async () => {
    const wrapper = mountModal();
    const backdrop = wrapper.find(".absolute.inset-0");

    await backdrop.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("debe validar que el título es requerido", async () => {
    const wrapper = mountModal();
    const createButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Crear"));

    // Intentar crear sin título
    await createButton?.trigger("click");

    // No debe emitir create si el título está vacío
    expect(wrapper.emitted("create")).toBeFalsy();
  });

  it("debe permitir seleccionar un icono", async () => {
    const wrapper = mountModal();
    const iconButtons = wrapper
      .findAll("button")
      .filter(
        (btn) =>
          btn.find("svg").exists() &&
          !btn.text().includes("Cancelar") &&
          !btn.text().includes("Crear")
      );

    expect(iconButtons.length).toBeGreaterThan(0);
  });

  it("debe permitir seleccionar un color", async () => {
    const wrapper = mountModal();
    const colorButtons = wrapper
      .findAll("button")
      .filter((btn) => btn.attributes("class")?.includes("rounded-full"));

    expect(colorButtons.length).toBeGreaterThan(0);
  });

  it("debe emitir evento create con los datos correctos", async () => {
    const wrapper = mountModal();

    // Llenar el formulario
    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue("Mi Proyecto");

    const descriptionTextarea = wrapper.find("textarea");
    await descriptionTextarea.setValue("Descripción del proyecto");

    // Hacer clic en crear
    const createButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Crear"));
    await createButton?.trigger("click");

    // Verificar que se emitió el evento con los datos correctos
    const emitted = wrapper.emitted("create");
    expect(emitted).toBeTruthy();
    if (emitted) {
      expect(emitted[0]![0]).toMatchObject({
        title: "Mi Proyecto",
        description: "Descripción del proyecto",
      });
    }
  });

  it("debe resetear el formulario después de crear", async () => {
    const wrapper = mountModal();

    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue("Test Project");

    const createButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Crear"));
    await createButton?.trigger("click");

    // Verificar que el input se limpió
    expect((titleInput.element as HTMLInputElement).value).toBe("");
  });

  it("debe tener un icono y color por defecto seleccionados", () => {
    const wrapper = mountModal();

    // Verificar que hay elementos seleccionados visualmente
    const selectedIcon = wrapper.find(".bg-indigo-100");
    const selectedColor = wrapper.find('[class*="ring-2"]');

    expect(selectedIcon.exists() || selectedColor.exists()).toBe(true);
  });
});
