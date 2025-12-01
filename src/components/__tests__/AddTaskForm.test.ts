import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AddTaskForm from '../AddTaskForm.vue';

describe('AddTaskForm', () => {
  it('debe renderizar el formulario correctamente', () => {
    const wrapper = mount(AddTaskForm);

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('debe tener placeholder correcto en el input', () => {
    const wrapper = mount(AddTaskForm);
    const input = wrapper.find('input[type="text"]');

    expect(input.attributes('placeholder')).toBe('Agregar nueva tarea...');
  });

  it('debe actualizar el modelo cuando se escribe en el input', async () => {
    const wrapper = mount(AddTaskForm);
    const input = wrapper.find('input[type="text"]');

    await input.setValue('Nueva tarea de prueba');

    expect((input.element as HTMLInputElement).value).toBe('Nueva tarea de prueba');
  });

  it('debe agregar una tarea cuando se envía el formulario', async () => {
    const wrapper = mount(AddTaskForm);
    const input = wrapper.find('input[type="text"]');
    const form = wrapper.find('form');

    await input.setValue('Tarea de prueba');
    await form.trigger('submit.prevent');

    // Verificar que el input se limpió después de agregar
    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('no debe agregar tarea si el input está vacío', async () => {
    const wrapper = mount(AddTaskForm);
    const form = wrapper.find('form');
    const input = wrapper.find('input[type="text"]');

    await input.setValue('');
    await form.trigger('submit.prevent');

    // El input debe seguir vacío
    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('no debe agregar tarea si el input solo tiene espacios', async () => {
    const wrapper = mount(AddTaskForm);
    const form = wrapper.find('form');
    const input = wrapper.find('input[type="text"]');

    await input.setValue('   ');
    await form.trigger('submit.prevent');

    // El input debe seguir con espacios (no se limpia si no se agrega)
    expect((input.element as HTMLInputElement).value).toBe('   ');
  });

  it('debe mostrar el botón con texto "Agregar"', () => {
    const wrapper = mount(AddTaskForm);
    const button = wrapper.find('button[type="submit"]');

    expect(button.text()).toContain('Agregar');
  });

  it('debe tener el icono SVG en el botón', () => {
    const wrapper = mount(AddTaskForm);
    const button = wrapper.find('button[type="submit"]');
    const svg = button.find('svg');

    expect(svg.exists()).toBe(true);
  });
});
