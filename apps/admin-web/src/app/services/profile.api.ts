// ============================================================================
// PROFILE API - Get current user profile from backend
// ============================================================================
// ✅ FIXED: Removed duplicate /api/v1 prefix (baseURL already includes it)
// Backend endpoint: GET /api/v1/profiles/me
// Frontend call: http.get("/profiles/me") → resolves to correct URL
// ============================================================================

import { z } from "zod";
import { http } from "./http";

// Role definition nested schema
const RoleDefinitionSchema = z.object({
  role_name: z.string(),
});

// User role nested schema
const UserRoleSchema = z.object({
  role_definition: RoleDefinitionSchema,
});

// Main profile response schema - matches ProfileOut from backend
export const ProfileSchema = z.object({
  user_id: z.string().uuid(),
  school_id: z.number(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  is_active: z.boolean(),
  roles: z.array(UserRoleSchema).default([]),
  teacher: z.any().nullable().optional(),
  student: z.any().nullable().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Fetch current authenticated user's profile
 * Endpoint: GET /api/v1/profiles/me
 * Returns: Profile with school_id, user_id, roles, etc.
 *
 * ✅ FIXED: Changed from "/api/v1/profiles/me" to "/profiles/me"
 * Because baseURL already contains /api/v1
 */
export async function getMyProfile(): Promise<Profile> {
  const { data } = await http.get("/profiles/me");
  return ProfileSchema.parse(data);
}

/**
 * Extract primary role from profile
 * Priority: Admin > Teacher > Parent > Student
 */
export function getPrimaryRole(profile: Profile): "admin" | "teacher" | "student" | "parent" {
  const roleNames = profile.roles.map((r) => r.role_definition.role_name.toLowerCase());

  if (roleNames.includes("admin")) return "admin";
  if (roleNames.includes("teacher")) return "teacher";
  if (roleNames.includes("parent")) return "parent";
  if (roleNames.includes("student")) return "student";

  // Default fallback
  return "student";
}
