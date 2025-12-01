import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskCard from '../TaskCard.vue';
import type { Task } from '../../types/global';

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Tarea de prueba',
    completed: false,
    createdAt: new Date('2024-01-01T12:00:00'),
  };

  it('debe renderizar la tarea correctamente', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    expect(wrapper.text()).toContain('Tarea de prueba');
  });

  it('debe mostrar el checkbox', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);
  });

  it('debe marcar el checkbox si la tarea está completada', () => {
    const completedTask: Task = { ...mockTask, completed: true };
    const wrapper = mount(TaskCard, {
      props: { task: completedTask },
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it('debe aplicar estilo tachado al título si está completada', () => {
    const completedTask: Task = { ...mockTask, completed: true };
    const wrapper = mount(TaskCard, {
      props: { task: completedTask },
    });

    const title = wrapper.find('h3');
    expect(title.classes()).toContain('line-through');
  });

  it('debe mostrar el botón de eliminar', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    const deleteButton = wrapper.find('button');
    expect(deleteButton.exists()).toBe(true);
  });

  it('debe mostrar el icono SVG de eliminar', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    const svg = wrapper.find('button svg');
    expect(svg.exists()).toBe(true);
  });

  it('debe mostrar la fecha de creación formateada', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    const dateText = wrapper.find('p.text-xs');
    expect(dateText.exists()).toBe(true);
    expect(dateText.text()).toBeTruthy();
  });

  it('debe tener el título con cursor-text para indicar edición', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    const title = wrapper.find('h3');
    expect(title.classes()).toContain('cursor-text');
  });

  it('debe aplicar clases de glassmorphism al contenedor', () => {
    const wrapper = mount(TaskCard, {
      props: { task: mockTask },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('glass-card');
    expect(container.classes()).toContain('rounded-2xl');
  });
});
