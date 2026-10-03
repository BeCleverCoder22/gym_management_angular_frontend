export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id?: number;
    username: string;
    email: string;
    role: UserRole;
    enabled?: boolean;
    password?: string;
    createdAt?: Date;
    lastLogin?: Date;
  }