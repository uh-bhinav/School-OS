import { z } from "zod";

// Teacher schema for dropdowns
export const Teacher = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
  subjects: z.array(z.number()).optional(), // subject IDs they can teach
});
export type Teacher = z.infer<typeof Teacher>;

// Subject schema for dropdowns
export const Subject = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().optional(),
  class_id: z.number().optional(),
});
export type Subject = z.infer<typeof Subject>;

// Room schema
export const Room = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number().optional(),
});
export type Room = z.infer<typeof Room>;
