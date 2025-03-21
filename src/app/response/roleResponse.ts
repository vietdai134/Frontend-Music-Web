import { Role } from "../models/role.module";

export interface RoleResponse{
    content:Role[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}