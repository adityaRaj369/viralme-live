import type { Role } from "@prisma/client";

const ROLE_RANK: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasMinRole(userRole: Role, required: Role) {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}
