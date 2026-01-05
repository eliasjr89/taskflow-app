import { z } from "zod";

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().optional().nullable(),
});

export const TaskSchema = z.object({
  id: z.number(),
  description: z.string(), // Mapped to 'title' in store, but API sends description
  completed: z.boolean(),
  created_at: z.string().or(z.date()), // API sends ISO string
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().nullable(),
  due_date: z.string().nullable().optional(),
  project_id: z.number().nullable().optional(),
  project_name: z.string().optional().nullable(),
  tags: z.array(TagSchema).optional(),
  // Add other fields as needed based on API response
});

export const TaskListResponseSchema = z.object({
  tasks: z.array(TaskSchema),
});

export type APITask = z.infer<typeof TaskSchema>;
