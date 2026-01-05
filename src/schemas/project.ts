import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string().or(z.date()),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export const ProjectListResponseSchema = z.object({
  projects: z.array(ProjectSchema),
});

export type APIProject = z.infer<typeof ProjectSchema>;
