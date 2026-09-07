import { User } from "./auth";

export interface UserListItem extends User {
  _count?: {
    orders?: number;
    reviews?: number;
  };
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  role?: "USER" | "ADMIN";
  isActive?: boolean;
}
