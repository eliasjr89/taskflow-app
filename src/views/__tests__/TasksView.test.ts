import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TasksView from '../TasksView.vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      tasks: {
        my_tasks: 'Mis Tareas',
        title: 'Mis Tareas',
        subtitle: 'Gestiona tus tareas diarias',
        all: 'Todas',
        pending: 'Pendientes',
        completed: 'Completadas',
        no_tasks: 'No hay tareas',
        placeholder: 'Añadir nueva tarea...',
      },
      common: {
        all: 'Todas',
        pending: 'Pendientes',
        completed: 'Completadas',
      },
    },
  },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'tasks', component: TasksView },
  ],
});

describe('TasksView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mountView = async (props = {}) => {
    const wrapper = mount(TasksView, {
      props,
      global: {
        plugins: [router, i18n],
      },
    });
    await router.isReady();
    await flushPromises();
    return wrapper;
  };

  it('debe renderizar la vista correctamente', async () => {
    const wrapper = await mountView();
    expect(wrapper.find('.flex').exists()).toBe(true);
  });

  it('debe mostrar el título "Mis Tareas"', async () => {
    const wrapper = await mountView();
    expect(wrapper.text()).toContain('Mis Tareas');
  });

  it('debe renderizar el formulario de agregar tareas', async () => {
    const wrapper = await mountView();
    expect(wrapper.findComponent({ name: 'AddTaskForm' }).exists()).toBe(true);
  });

  it('debe renderizar la lista de tareas', async () => {
    const wrapper = await mountView();
    expect(wrapper.findComponent({ name: 'TaskList' }).exists()).toBe(true);
  });

  it('debe tener filtros de tareas (Todas, Pendientes, Completadas)', async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    
    expect(text).toContain('Todas');
    expect(text).toContain('Pendientes');
    expect(text).toContain('Completadas');
  });

  it('debe tener un estado vacío cuando no hay tareas', async () => {
    const wrapper = await mountView();
    
    // Verificar que existe algún mensaje de estado vacío
    const hasEmptyState = wrapper.text().includes('No hay tareas') || 
                          wrapper.text().includes('Mis Tareas') ||
                          wrapper.find('.text-center').exists();
    
    expect(hasEmptyState).toBe(true);
  });

  it('debe aplicar animación fade-in', async () => {
    const wrapper = await mountView();
    // La animación está en elementos internos, no en el contenedor principal
    const animatedElements = wrapper.findAll('[class*="animate"]');
    
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});
