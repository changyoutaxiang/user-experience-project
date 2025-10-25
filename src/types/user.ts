/**
 * User-related TypeScript types.
 */

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface LoginCredentials {
  username: string // email
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface UserCreateRequest {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface UserUpdateRequest {
  name?: string
  role?: UserRole
}
