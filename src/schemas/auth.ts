import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  lastname: z.string().nullable().optional(),
  role: z.enum(["admin", "manager", "user"]),
  profile_image: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
