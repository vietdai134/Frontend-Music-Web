import { Role } from "./role.module";

export interface User{
    userId:number;
    userName:string;
    email:string;
    accountType:string;
    createdDate:Date;
    avatar?: string;
    permissions:string[] | null;
    roles:Role[];

    authProvider:string;
}