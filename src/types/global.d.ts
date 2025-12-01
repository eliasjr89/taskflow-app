export interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  projectId?: string;
  tags?: string[]; // Array of tag IDs
  priority?: Priority;
  dueDate?: Date;
}
