import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiResponse,
  User,
  File,
  PaginatedResponse,
  StorageUsage,
} from "../types";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<ApiResponse> => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },
};

// Files API
export const filesAPI = {
  getFiles: async (
    filters: any = {}
  ): Promise<ApiResponse<PaginatedResponse<File>>> => {
    const response = await api.get("/files", { params: filters });
    return response.data;
  },

  uploadFile: async (
    file: File,
    category: string = "My Files"
  ): Promise<ApiResponse<{ file: File }>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getFile: async (id: string): Promise<ApiResponse<{ file: File }>> => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  updateFile: async (
    id: string,
    data: { name?: string; category?: string }
  ): Promise<ApiResponse<{ file: File }>> => {
    const response = await api.put(`/files/${id}`, data);
    return response.data;
  },

  deleteFile: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  restoreFile: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/files/${id}/restore`);
    return response.data;
  },

  shareFile: async (id: string, userEmail: string): Promise<ApiResponse> => {
    const response = await api.post(`/files/${id}/share`, { userEmail });
    return response.data;
  },

  unshareFile: async (id: string, userId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/files/${id}/share/${userId}`);
    return response.data;
  },

  getFileShares: async (
    id: string
  ): Promise<ApiResponse<{ shares: any[] }>> => {
    const response = await api.get(`/files/${id}/shares`);
    return response.data;
  },

  downloadFile: async (
    id: string
  ): Promise<
    ApiResponse<{ downloadUrl: string; fileName: string; mimeType: string }>
  > => {
    const response = await api.get(`/files/${id}/download`);
    return response.data;
  },

  getStorageUsage: async (): Promise<ApiResponse<StorageUsage>> => {
    const response = await api.get("/files/storage/usage");
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    avatar?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  deleteAccount: async (): Promise<ApiResponse> => {
    const response = await api.delete("/users/profile");
    return response.data;
  },

  searchUsers: async (
    query: string
  ): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get("/users/search", { params: { q: query } });
    return response.data;
  },
};

export default api;
