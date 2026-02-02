export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  role: "admin" | "user" | "manager";
  num_tasks?: number;
  num_projects?: number;
  profile_image?: string;
  created_at?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: any;
  projects?: { id: number; name: string }[];
  tasks?: { id: number; description: string }[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  creator_id?: number;
  creator_username?: string;
  created_at?: string;
  task_count?: number;
  member_count?: number;
  // Mapped from backend typically as num_... or we should unify.
  // For now adding both to support current repo transform
  num_tasks?: number;
  num_team_members?: number;
  users?: User[];
  color?: string;
  icon?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface Task {
  id: number;
  description: string;
  project_id: number;
  project_name?: string;
  status_id: number;
  status?: string;
  status_name?: string;
  priority: "low" | "medium" | "high" | "urgent";
  tags?: Tag[];
  created_at?: string;
  due_date?: string | null;
  users?: User[];
}

export interface TaskStatus {
  id: number;
  name: string;
}
