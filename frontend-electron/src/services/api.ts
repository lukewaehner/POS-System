import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// API Configuration
const API_CONFIG = {
  baseURL: "http://localhost:3001/api",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    config.params = {
      ...config.params,
      _t: timestamp,
    };

    // Add authentication token if available
    const token = localStorage.getItem("pos_auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      console.error("❌ API Error Response:", {
        status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data,
      });

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("pos_auth_token");
          // Could trigger a login modal or redirect here
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.warn("🚫 Access denied");
          break;
        case 404:
          // Not found
          console.warn("🔍 Resource not found");
          break;
        case 500:
          // Server error
          console.error("🔥 Server error");
          break;
        default:
          console.error(`💥 HTTP Error ${status}`);
      }
    } else if (error.request) {
      // Network error - no response received
      console.error("🌐 Network Error:", {
        message: "No response from server",
        url: error.config?.url,
        timeout: error.code === "ECONNABORTED",
      });
    } else {
      // Something else happened
      console.error("⚠️ Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// API Client interface for type safety
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

// Error response interface
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}

// HTTP Methods with type safety
export const api = {
  // GET request
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get(url, config);
  },

  // POST request
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, data, config);
  },

  // PUT request
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put(url, data, config);
  },

  // DELETE request
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete(url, config);
  },

  // PATCH request
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch(url, data, config);
  },
};

// Utility functions for common patterns
export const apiUtils = {
  // Set authentication token
  setAuthToken: (token: string) => {
    localStorage.setItem("pos_auth_token", token);
  },

  // Clear authentication token
  clearAuthToken: () => {
    localStorage.removeItem("pos_auth_token");
  },

  // Get authentication token
  getAuthToken: (): string | null => {
    return localStorage.getItem("pos_auth_token");
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("pos_auth_token");
  },

  // Test API connection
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await api.get("/test");
      return response.status === 200;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  },

  // Test database connection
  testDatabase: async (): Promise<boolean> => {
    try {
      const response = await api.get("/test/database");
      return response.status === 200;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  },
};

// Error handling utilities
export const handleApiError = (error: AxiosError<ApiErrorResponse>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Export the configured client for direct use if needed
export { apiClient };

export default api;
