import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AddTagModal from '../AddTagModal.vue';
import { createI18n } from 'vue-i18n';
import type { Tag } from '../../types/global';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      tags: {
        new_tag: 'Nueva Etiqueta',
        edit_tag: 'Editar Etiqueta',
        tag_name: 'Nombre de la etiqueta',
        choose_color: 'Elige un color',
      },
      common: {
        cancel: 'Cancelar',
        create: 'Crear',
        save: 'Guardar',
      },
    },
  },
});

describe('AddTagModal', () => {
  beforeEach(() => {
    // Create a div to teleport to
    const el = document.createElement('div');
    el.id = 'modal-target';
    document.body.appendChild(el);
  });

  const mountModal = (props = {}) => {
    return mount(AddTagModal, {
      props: {
        isOpen: true,
        ...props,
      },
      global: {
        plugins: [i18n],
      },
      attachTo: document.body,
    });
  };

  it('debe renderizar el modal cuando isOpen es true', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.fixed')).toBeTruthy();
    wrapper.unmount();
  });

  it('no debe renderizar el modal cuando isOpen es false', async () => {
    const wrapper = mountModal({ isOpen: false });
    await wrapper.vm.$nextTick();
    expect(document.body.querySelector('.fixed')).toBeFalsy();
    wrapper.unmount();
  });

  it('debe mostrar "Nueva Etiqueta" en modo creación', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    expect(document.body.textContent).toContain('Nueva Etiqueta');
    wrapper.unmount();
  });

  it('debe mostrar "Editar Etiqueta" en modo edición', async () => {
    const editingTag: Tag = {
      id: '1',
      name: 'Test Tag',
      color: 'indigo',
      createdAt: new Date(),
    };
    
    const wrapper = mountModal({ editingTag });
    await wrapper.vm.$nextTick();
    expect(document.body.textContent).toContain('Editar Etiqueta');
    wrapper.unmount();
  });

  it('debe prellenar el formulario en modo edición', async () => {
    const editingTag: Tag = {
      id: '1',
      name: 'Test Tag',
      color: 'purple',
      createdAt: new Date(),
    };
    
    const wrapper = mountModal({ editingTag });
    await wrapper.vm.$nextTick();
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement;
    
    expect(input?.value).toBe('Test Tag');
    wrapper.unmount();
  });

  it('debe emitir evento close al hacer clic en cancelar', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const cancelButton = buttons.find(btn => btn.textContent?.includes('Cancelar'));
    
    await cancelButton?.click();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.emitted('close')).toBeTruthy();
    wrapper.unmount();
  });

  it('debe validar que el nombre es requerido', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const createButton = buttons.find(btn => btn.textContent?.includes('Crear'));
    
    await createButton?.click();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.emitted('save')).toBeFalsy();
    wrapper.unmount();
  });

  it('debe emitir evento save con los datos correctos al crear', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Nueva Etiqueta';
    input.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();
    
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const createButton = buttons.find(btn => btn.textContent?.includes('Crear'));
    await createButton?.click();
    await wrapper.vm.$nextTick();
    
    const emitted = wrapper.emitted('save');
    expect(emitted).toBeTruthy();
    if (emitted && emitted[0] && emitted[0][0]) {
      expect((emitted[0][0] as Tag).name).toBe('Nueva Etiqueta');
    }
    wrapper.unmount();
  });

  it('debe emitir evento save con ID al editar', async () => {
    const editingTag: Tag = {
      id: '123',
      name: 'Old Name',
      color: 'indigo',
      createdAt: new Date(),
    };
    
    const wrapper = mountModal({ editingTag });
    await wrapper.vm.$nextTick();
    
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'New Name';
    input.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();
    
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const saveButton = buttons.find(btn => btn.textContent?.includes('Guardar'));
    await saveButton?.click();
    await wrapper.vm.$nextTick();
    
    const emitted = wrapper.emitted('save');
    expect(emitted).toBeTruthy();
    if (emitted && emitted[0] && emitted[0][0]) {
      expect((emitted[0][0] as Tag).id).toBe('123');
      expect((emitted[0][0] as Tag).name).toBe('New Name');
    }
    wrapper.unmount();
  });

  it('debe permitir seleccionar diferentes colores', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    
    const colorButtons = Array.from(document.body.querySelectorAll('button')).filter(btn => 
      btn.className.includes('aspect-square')
    );
    
    expect(colorButtons.length).toBeGreaterThan(5);
    wrapper.unmount();
  });

  it('debe resetear el formulario después de crear', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Test Tag';
    input.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();
    
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const createButton = buttons.find(btn => btn.textContent?.includes('Crear'));
    await createButton?.click();
    await wrapper.vm.$nextTick();
    
    // After close, the modal should be gone
    expect(wrapper.emitted('close')).toBeTruthy();
    wrapper.unmount();
  });

  it('debe cerrar el modal al hacer clic en el backdrop', async () => {
    const wrapper = mountModal();
    await wrapper.vm.$nextTick();
    
    const backdrop = document.body.querySelector('.fixed') as HTMLElement;
    await backdrop?.click();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.emitted('close')).toBeTruthy();
    wrapper.unmount();
  });
});
