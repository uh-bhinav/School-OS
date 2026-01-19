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
export function getPrimaryRole(
  profile: Profile
): "admin" | "front_office" | "teacher" | "student" | "parent" {
  const roleNames = profile.roles.map((r) => r.role_definition.role_name.toLowerCase());

  // ✅ Role priority order (highest to lowest)
  if (roleNames.includes("admin")) return "admin";
  if (roleNames.includes("front_office")) return "front_office";
  if (roleNames.includes("teacher")) return "teacher";
  if (roleNames.includes("parent")) return "parent";
  if (roleNames.includes("student")) return "student";

  // Default fallback
  return "student";
}

/**
 * Check if user has a specific role
 *
 * @param profile - User profile
 * @param roleName - Role to check (case-insensitive)
 * @returns true if user has the role
 */
export function hasRole(profile: Profile, roleName: string): boolean {
  return profile.roles.some(
    (r) => r.role_definition.role_name.toLowerCase() === roleName.toLowerCase()
  );
}

/**
 * Check if user has ANY of the specified roles
 *
 * @param profile - User profile
 * @param roleNames - Array of role names to check
 * @returns true if user has at least one of the roles
 */
export function hasAnyRole(profile: Profile, roleNames: string[]): boolean {
  return roleNames.some((roleName) => hasRole(profile, roleName));
}

/**
 * Get display name for user
 */
export function getDisplayName(profile: Profile): string {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  if (profile.first_name) return profile.first_name;
  if (profile.last_name) return profile.last_name;
  return "User";
}
