import { toast } from "@/hooks/use-toast";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiClient {
  private baseURL: string;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(baseURL: string = "", retryAttempts: number = 3, retryDelay: number = 1000) {
    this.baseURL = baseURL;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = this.baseURL + endpoint;
      const response = await this.fetchWithRetry(url, {
        ...options,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      this.handleClientError(error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    try {
      const url = this.baseURL + endpoint;
      const response = await this.fetchWithRetry(url, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      this.handleClientError(error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    try {
      const url = this.baseURL + endpoint;
      const response = await this.fetchWithRetry(url, {
        ...options,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      this.handleClientError(error);
      throw error;
    }
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = this.baseURL + endpoint;
      const response = await this.fetchWithRetry(url, {
        ...options,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      this.handleClientError(error);
      throw error;
    }
  }

  private async handleError(response: Response): Promise<ApiError> {
    let message = "An error occurred";
    
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      message = response.statusText || message;
    }

    return {
      message,
      status: response.status,
      code: response.status.toString(),
    };
  }

  private handleClientError(error: any): void {
    console.error("API Client Error:", error);
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      toast({
        title: "Network Error",
        description: "Please check your internet connection",
        variant: "destructive",
      });
    }
  }
}

// Default instance
export const apiClient = new ApiClient();
