import { createI18n } from 'vue-i18n';

export const createTestI18n = () => createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      tasks: {
        task_title: 'Task Title',
        add_description: 'Add description...',
        project: 'Project',
        priority: 'Priority',
        due_date: 'Due Date',
        tags: 'Tags',
        no_project: 'No Project',
        no_priority: 'No Priority',
        confirm_delete: 'Confirm Delete',
        completed: 'Completed',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      common: {
        all: 'All',
        pending: 'Pending',
        completed: 'Completed',
        search: 'Search',
        save: 'Save',
        close: 'Close',
        delete: 'Delete',
        add: 'Add'
      }
    },
    es: {
      tasks: {
        task_title: 'Título de la tarea',
        add_description: 'Añadir descripción...',
        project: 'Proyecto',
        priority: 'Prioridad',
        due_date: 'Fecha de vencimiento',
        tags: 'Etiquetas',
        no_project: 'Sin Proyecto',
        no_priority: 'Sin Prioridad',
        confirm_delete: 'Confirmar Eliminación',
        completed: 'Completada',
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        urgent: 'Urgente'
      },
      common: {
        all: 'Todos',
        pending: 'Pendientes',
        completed: 'Completadas',
        search: 'Buscar',
        save: 'Guardar',
        close: 'Cerrar',
        delete: 'Eliminar',
        add: 'Agregar'
      }
    }
  }
});
