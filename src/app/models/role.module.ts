import { Permission } from "./permission.module";

export interface Role {
    roleId: number;
    roleName: string;
    description: string;

    permissions:Permission[];
  }