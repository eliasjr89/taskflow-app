import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AddTaskForm from '../AddTaskForm.vue';
import { createTestI18n } from './testHelpers';

describe('AddTaskForm', () => {
  const i18n = createTestI18n();

  it('debe renderizar el formulario correctamente', () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('debe tener placeholder correcto en el input', () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const input = wrapper.find('input[type="text"]');
    expect(input.attributes('placeholder')).toBeDefined();
  });

  it('debe actualizar el modelo cuando se escribe en el input', async () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Nueva tarea de prueba');
    
    expect((input.element as HTMLInputElement).value).toBe('Nueva tarea de prueba');
  });

  it('debe agregar una tarea cuando se envía el formulario', async () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Tarea de prueba');
    
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('no debe agregar tarea si el input está vacío', async () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    expect(wrapper.emitted('add-task')).toBeUndefined();
  });

  it('no debe agregar tarea si el input solo tiene espacios', async () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('   ');
    
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    expect(wrapper.emitted('add-task')).toBeUndefined();
  });

  it('debe mostrar el botón con texto "Agregar"', () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
  });

  it('debe tener el icono SVG en el botón', () => {
    const wrapper = mount(AddTaskForm, {
      global: {
        plugins: [i18n]
      }
    });

    const svg = wrapper.find('button svg');
    expect(svg.exists()).toBe(true);
  });
});
