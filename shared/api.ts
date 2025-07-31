// Demo response (existing)
export interface DemoResponse {
  message: string;
}

// User interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  semester: string;
  profilePhoto?: string;
  githubId?: string;
  gmailId?: string;
  createdAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  department: string;
  semester: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Project interfaces
export interface Project {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  department: string;
  year: string;
  category: string;
  level: string;
  tags: string[];
  features?: string;
  supervisor?: string;
  collaborators?: string;
  githubRepo?: string;
  deployLink?: string;
  githubId?: string;
  gmailId?: string;
  views: number;
  rating: number;
  ratings: Array<{ userId: string; rating: number }>;
  files: Array<{ type: string; name: string; url: string }>;
  facultyValidation: "pending" | "approved" | "disapproved";
  facultyComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  department: string;
  year: string;
  category: string;
  level: string;
  tags: string[];
  features?: string;
  supervisor?: string;
  collaborators?: string;
  githubRepo?: string;
  deployLink?: string;
  githubId?: string;
  gmailId?: string;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  total: number;
  hasMore: boolean;
}

export interface ProjectResponse {
  success: boolean;
  project: Project;
}

export interface ProjectStatsResponse {
  success: boolean;
  stats: {
    byYear: Record<string, number>;
    byDepartment: Record<string, number>;
    byCategory: Record<string, number>;
    total: number;
    totalDownloads: number;
  };
}

// API Error Response
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Common query parameters
export interface ProjectsQueryParams {
  year?: string;
  department?: string;
  category?: string;
  search?: string;
  sortBy?: "recent" | "popular" | "rating" | "year";
  limit?: number;
  offset?: number;
}

// File upload interfaces
export interface ProjectFile {
  type: "documentation" | "source" | "media";
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// Rating interface
export interface RateProjectRequest {
  rating: number; // 1-5
}

export interface RatingResponse {
  success: boolean;
  message: string;
  rating: number;
}

// Download response
export interface DownloadResponse {
  success: boolean;
  message: string;
  downloads: number;
}

// Available years response
export interface AvailableYearsResponse {
  success: boolean;
  years: string[];
}
