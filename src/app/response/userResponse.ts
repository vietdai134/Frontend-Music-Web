import { User } from "../models/user.module";

export interface UserResponse {
    content: User[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    };
  }