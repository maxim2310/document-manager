import { UserRoleEnum } from "./RolesEnum";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleEnum;
}