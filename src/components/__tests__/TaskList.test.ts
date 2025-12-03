import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskList from '../TaskList.vue';
import { createTestI18n } from './testHelpers';
import TaskCard from '../TaskCard.vue';
import type { Task } from '../../types/global';

describe('TaskList', () => {
  const i18n = createTestI18n();

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Tarea 1',
      completed: false,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      title: 'Tarea 2',
      completed: true,
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 3,
      title: 'Tarea 3',
      completed: false,
      createdAt: new Date('2024-01-03'),
    },
  ];

  it('debe renderizar la lista de tareas', () => {
    const wrapper = mount(TaskList, {
      props: {
        tasks: mockTasks,
      },
      global: {
        components: {
          TaskCard,
        },
        plugins: [i18n]
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Tarea 1');
  });

  it('debe renderizar el número correcto de tareas', () => {
    const wrapper = mount(TaskList, {
      props: {
        tasks: mockTasks,
      },
      global: {
        components: {
          TaskCard,
        },
        plugins: [i18n]
      },
    });

    // Verificar que se renderizaron los títulos de las tareas
    expect(wrapper.text()).toContain('Tarea 1');
    expect(wrapper.text()).toContain('Tarea 2');
    expect(wrapper.text()).toContain('Tarea 3');
  });

  it('debe renderizar con array vacío de tareas', () => {
    const wrapper = mount(TaskList, {
      props: {
        tasks: [],
      },
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('debe tener la clase correcta para el contenedor', () => {
    const wrapper = mount(TaskList, {
      props: {
        tasks: mockTasks,
      },
      global: {
        plugins: [i18n]
      }
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('flex-col');
    expect(container.classes()).toContain('gap-3');
  });

  it('debe aceptar selectedTaskId como prop opcional', () => {
    const wrapper = mount(TaskList, {
      props: {
        tasks: mockTasks,
        selectedTaskId: 1,
      },
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
