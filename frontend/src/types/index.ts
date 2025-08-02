// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// File types (renamed to CloudFile to avoid conflicts with browser File type)
export interface CloudFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url?: string;
  thumbnail?: string;
  isDeleted: boolean;
  deletedAt?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  sharedWith: FileShare[];
}

// File share types
export interface FileShare {
  id: string;
  createdAt: string;
  updatedAt: string;
  sharedWithUser: User;
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

// Storage usage
export interface StorageUsage {
  totalSize: number;
  fileCount: number;
  totalSizeMB: number;
}

// Upload progress
export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

// Theme
export type Theme = "light" | "dark";

// Auth context
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// File actions
export interface FileAction {
  id: string;
  label: string;
  icon: string;
  onClick: (file: CloudFile) => void;
  disabled?: (file: CloudFile) => boolean;
}

// Navigation item
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
