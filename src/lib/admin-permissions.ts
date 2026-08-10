export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export const VIEWER_ROLES: readonly AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
export const MANAGER_ROLES: readonly AdminRole[] = ["SUPER_ADMIN", "ADMIN"];
export const SUPER_ADMIN_ROLES: readonly AdminRole[] = ["SUPER_ADMIN"];

export function hasAdminRole(
  role: string | null | undefined,
  allowedRoles: readonly AdminRole[],
): role is AdminRole {
  return allowedRoles.includes(role as AdminRole);
}
