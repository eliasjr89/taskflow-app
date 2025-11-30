export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  projectId?: string;
}
