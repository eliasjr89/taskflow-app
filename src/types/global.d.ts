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

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  projectId?: string;
  tags?: string[]; // Array of tag IDs
  priority?: Priority;
  dueDate?: Date;
  description?: string;
  projectName?: string;
  projectColor?: string;
  projectIcon?: string;
}
export interface FilterState {
  search: string;
  statuses: ("pending" | "completed")[];
  priorities: string[];
  projectIds: string[];
  tagIds: string[];
}
