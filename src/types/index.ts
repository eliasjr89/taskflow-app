export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  role: "admin" | "user" | "manager";
  profile_image?: string;
  created_at?: string;
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
  priority: "low" | "medium" | "high";
  tags?: Tag[];
  created_at?: string;
  due_date?: string | null;
}

export interface TaskStatus {
  id: number;
  name: string;
}
