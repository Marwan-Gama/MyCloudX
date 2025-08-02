import { Request } from "express";
import { User, File, FileShare } from "@prisma/client";

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// User types
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
}

// File types
export interface CreateFileInput {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string;
  thumbnail?: string;
  category?: string;
}

export interface UpdateFileInput {
  name?: string;
  category?: string;
}

export interface FileWithOwner extends File {
  owner: User;
}

export interface FileWithShares extends File {
  owner: User;
  sharedWith: (FileShare & {
    sharedWithUser: User;
  })[];
}

// File sharing types
export interface ShareFileInput {
  fileId: string;
  userEmail: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File categories
export type FileCategory = "Home" | "My Files" | "Shared" | "Trash";

// File view modes
export type ViewMode = "grid" | "list";

// Sort options
export type SortOption = "name" | "date" | "size";

// Sort direction
export type SortDirection = "asc" | "desc";

// File filter options
export interface FileFilters {
  category?: FileCategory;
  search?: string;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  page?: number;
  limit?: number;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Email templates
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// AWS S3 types
export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
}

// Error types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
