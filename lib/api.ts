import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';

// API Configuration
const API_BASE_URL = config.api.baseUrl;
const TOKEN_KEY = 'auth_token';

// Types
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Borrower {
  _id: string;
  name: string;
  phone?: string;
  address: string;
  village: string;
  gpsLat?: number;
  gpsLng?: number;
  photoUrl?: string;
  idProofUrl?: string;
  householdHead?: string;
  isActive: boolean;
  collectionDays: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  _id: string;
  loanNumber: string;
  principalAmount: number;
  disbursedAmount: number;
  termWeeks: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  borrower: {
    _id: string;
    name: string;
  };
  outstandingAmount: number;
  totalPaid: number;
  createdAt: string;
}

export interface CreateBorrowerData {
  name: string;
  phone?: string;
  address: string;
  village: string;
  gpsLat?: number;
  gpsLng?: number;
  photoUrl?: string;
  idProofUrl?: string;
  householdHead?: string;
  collectionDays: string[];
}

export interface CreateLoanData {
  principalAmount: number;
  disbursedAmount: number;
  termWeeks: number;
  startDate: string;
  borrowerId: string;
}

// API Service Class
class ApiService {
  private token: string | null = null;

  // Initialize token from storage
  async initialize() {
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Get auth headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
      }
      
      throw error;
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      

      
      // Based on the logs, the response has token and user directly
      if (response.success) {
        const token = (response as any).token;
        const user = (response as any).user;
        
        if (token && user) {
          this.token = token;
          await AsyncStorage.setItem(TOKEN_KEY, token);
          
          return {
            success: true,
            token,
            user
          };
        }
      }
      
      return {
        success: false,
        token: '',
        user: { id: '', username: '', name: '', role: '' }
      };
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  // Borrowers
  async getBorrowers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    collectionDay?: string;
  }): Promise<ApiResponse<Borrower[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.collectionDay) searchParams.append('collectionDay', params.collectionDay);
    
    const endpoint = `/borrowers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<Borrower[]>(endpoint);
  }

  async getBorrower(id: string): Promise<ApiResponse<Borrower>> {
    return this.request<Borrower>(`/borrowers/${id}`);
  }

  async createBorrower(data: CreateBorrowerData): Promise<ApiResponse<Borrower>> {
    return this.request<Borrower>('/borrowers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBorrower(id: string, data: Partial<CreateBorrowerData>): Promise<ApiResponse<Borrower>> {
    return this.request<Borrower>(`/borrowers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBorrower(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/borrowers/${id}`, {
      method: 'DELETE',
    });
  }

  // Loans
  async getLoans(): Promise<ApiResponse<Loan[]>> {
    return this.request<Loan[]>('/loans');
  }

  async getLoan(id: string): Promise<ApiResponse<Loan>> {
    return this.request<Loan>(`/loans/${id}`);
  }

  async createLoan(data: CreateLoanData): Promise<ApiResponse<Loan>> {
    return this.request<Loan>('/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLoan(id: string, data: Partial<CreateLoanData>): Promise<ApiResponse<Loan>> {
    return this.request<Loan>(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard/stats');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Initialize the service when the module is imported
apiService.initialize().catch(console.error); 