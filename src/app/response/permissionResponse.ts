import { Permission } from "../models/permission.module";

export interface PermissionResponse{
    content:Permission[];
        page: {
            size: number;
            number: number;
            totalElements: number;
            totalPages: number;
        };
}