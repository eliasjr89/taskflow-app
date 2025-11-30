import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { useTaskState } from '../useTaskState';

describe('useTaskState', () => {
  beforeEach(() => {
    // Limpiar localStorage
    localStorage.clear();
    // Limpiar el estado antes de cada prueba
    const { tasks } = useTaskState();
    tasks.value = [];
  });

  it('debe inicializar con un array vacío de tareas', () => {
    const { tasks } = useTaskState();
    expect(tasks.value).toEqual([]);
  });

  describe('sortedTasks', () => {
    it('debe ordenar tareas por fecha de creación (más reciente primero)', () => {
      const { tasks, sortedTasks } = useTaskState();

      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');

      tasks.value = [
        { id: 1, title: 'Tarea 1', completed: false, createdAt: date2 },
        { id: 2, title: 'Tarea 2', completed: false, createdAt: date1 },
        { id: 3, title: 'Tarea 3', completed: false, createdAt: date3 },
      ];

      expect(sortedTasks.value[0].createdAt).toEqual(date3);
      expect(sortedTasks.value[1].createdAt).toEqual(date2);
      expect(sortedTasks.value[2].createdAt).toEqual(date1);
    });
  });

  describe('pendingTasks', () => {
    it('debe filtrar solo tareas pendientes', () => {
      const { tasks, pendingTasks } = useTaskState();

      tasks.value = [
        { id: 1, title: 'Pendiente 1', completed: false, createdAt: new Date() },
        { id: 2, title: 'Completada', completed: true, createdAt: new Date() },
        { id: 3, title: 'Pendiente 2', completed: false, createdAt: new Date() },
      ];

      expect(pendingTasks.value).toHaveLength(2);
      expect(pendingTasks.value[0].title).toBe('Pendiente 1');
      expect(pendingTasks.value[1].title).toBe('Pendiente 2');
    });

    it('debe retornar array vacío si no hay tareas pendientes', () => {
      const { tasks, pendingTasks } = useTaskState();

      tasks.value = [
        { id: 1, title: 'Completada 1', completed: true, createdAt: new Date() },
        { id: 2, title: 'Completada 2', completed: true, createdAt: new Date() },
      ];

      expect(pendingTasks.value).toHaveLength(0);
    });
  });

  describe('completedTasks', () => {
    it('debe filtrar solo tareas completadas', () => {
      const { tasks, completedTasks } = useTaskState();

      tasks.value = [
        { id: 1, title: 'Pendiente', completed: false, createdAt: new Date() },
        { id: 2, title: 'Completada 1', completed: true, createdAt: new Date() },
        { id: 3, title: 'Completada 2', completed: true, createdAt: new Date() },
      ];

      expect(completedTasks.value).toHaveLength(2);
      expect(completedTasks.value[0].title).toBe('Completada 1');
      expect(completedTasks.value[1].title).toBe('Completada 2');
    });

    it('debe retornar array vacío si no hay tareas completadas', () => {
      const { tasks, completedTasks } = useTaskState();

      tasks.value = [
        { id: 1, title: 'Pendiente 1', completed: false, createdAt: new Date() },
        { id: 2, title: 'Pendiente 2', completed: false, createdAt: new Date() },
      ];

      expect(completedTasks.value).toHaveLength(0);
    });
  });

  describe('localStorage persistence', () => {
    it('debe guardar tareas en localStorage cuando cambian', async () => {
      const { tasks } = useTaskState();

      tasks.value = [
        { id: 1, title: 'Tarea guardada', completed: false, createdAt: new Date() },
      ];

      // Esperar a que el watch se ejecute
      await nextTick();

      const savedTasks = localStorage.getItem('tasks');
      expect(savedTasks).toBeDefined();
      
      const parsed = JSON.parse(savedTasks!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Tarea guardada');
    });
  });
});
