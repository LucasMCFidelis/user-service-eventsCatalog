import { UserRole } from "../../types/userRoleType.js";

export function ValidateRoleName(roleName: UserRole): boolean {
  if (roleName !== "Admin" && roleName !== "User") {
    return false;
  }

  return true;
}
