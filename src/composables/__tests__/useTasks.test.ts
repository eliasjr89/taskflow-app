import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTasks } from '../useTask';
import { useTaskState } from '../useTaskState';

describe('useTasks', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
    // Limpiar el estado de tareas de manera más robusta
    const { tasks } = useTaskState();
    tasks.value.splice(0, tasks.value.length); // Limpiar el array reactivo
  });

  afterEach(() => {
    // Limpieza adicional después de cada test
    const { tasks } = useTaskState();
    tasks.value.splice(0, tasks.value.length);
    localStorage.clear();
  });

  describe('addTask', () => {
    it('debe agregar una nueva tarea', () => {
      const { addTask } = useTasks();
      const { tasks } = useTaskState();

      addTask('Nueva tarea');

      expect(tasks.value).toHaveLength(1);
      expect(tasks.value[0].title).toBe('Nueva tarea');
      expect(tasks.value[0].completed).toBe(false);
      expect(tasks.value[0].id).toBeDefined();
      expect(tasks.value[0].createdAt).toBeInstanceOf(Date);
    });

    it('debe agregar múltiples tareas', () => {
      const { addTask } = useTasks();
      const { tasks } = useTaskState();

      addTask('Tarea 1');
      addTask('Tarea 2');
      addTask('Tarea 3');

      expect(tasks.value).toHaveLength(3);
      expect(tasks.value[0].title).toBe('Tarea 1');
      expect(tasks.value[1].title).toBe('Tarea 2');
      expect(tasks.value[2].title).toBe('Tarea 3');
    });
  });

  describe('removeTask', () => {
    it('debe eliminar una tarea existente', () => {
      const { addTask, removeTask } = useTasks();
      const { tasks } = useTaskState();

      addTask('Tarea a eliminar');
      const taskId = tasks.value[0].id;

      removeTask(taskId);

      expect(tasks.value).toHaveLength(0);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('debe marcar una tarea como completada', () => {
      const { addTask, toggleTaskCompletion } = useTasks();
      const { tasks } = useTaskState();

      addTask('Tarea pendiente');
      const taskId = tasks.value[0].id;

      toggleTaskCompletion(taskId);

      expect(tasks.value[0].completed).toBe(true);
    });

    it('debe desmarcar una tarea completada', () => {
      const { addTask, toggleTaskCompletion } = useTasks();
      const { tasks } = useTaskState();

      addTask('Tarea');
      const taskId = tasks.value[0].id;

      toggleTaskCompletion(taskId);
      expect(tasks.value[0].completed).toBe(true);

      toggleTaskCompletion(taskId);
      expect(tasks.value[0].completed).toBe(false);
    });
  });

  describe('updateTask', () => {
    it('debe actualizar el título de una tarea', () => {
      const { addTask, updateTask } = useTasks();
      const { tasks } = useTaskState();

      addTask('Título original');
      const taskId = tasks.value[0].id;

      updateTask(taskId, { title: 'Título actualizado' });

      expect(tasks.value[0].title).toBe('Título actualizado');
    });

    it('debe actualizar múltiples propiedades de una tarea', () => {
      const { addTask, updateTask } = useTasks();
      const { tasks } = useTaskState();

      addTask('Tarea');
      const taskId = tasks.value[0].id;

      updateTask(taskId, { title: 'Nuevo título', completed: true });

      expect(tasks.value[0].title).toBe('Nuevo título');
      expect(tasks.value[0].completed).toBe(true);
    });
  });

  describe('loadTask', () => {
    it('debe cargar tareas desde localStorage', () => {
      const { loadTask } = useTasks();
      const { tasks } = useTaskState();

      // Simular datos en localStorage
      const mockTasks = [
        {
          id: 1,
          title: 'Tarea guardada',
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('tasks', JSON.stringify(mockTasks));

      loadTask();

      expect(tasks.value).toHaveLength(1);
      expect(tasks.value[0].title).toBe('Tarea guardada');
      expect(tasks.value[0].createdAt).toBeInstanceOf(Date);
    });

    it('debe manejar localStorage vacío', () => {
      const { loadTask } = useTasks();
      const { tasks } = useTaskState();

      loadTask();

      expect(tasks.value).toHaveLength(0);
    });
  });
});
