import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';

// API Configuration
const API_BASE_URL = config.api.baseUrl;
const TOKEN_KEY = 'auth_token'; // Changed to match auth service

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

export interface Installment {
  _id: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  loanId: string;
  installmentNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  _id: string;
  amount: number;
  paymentDate: string;
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  installmentId: string;
  collectorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionData {
  amount: number;
  paymentDate: string;
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  installmentId: string;
  collectorId: string;
}

export interface PopulatedCollection extends Omit<Collection, 'installmentId' | 'collectorId'> {
  installmentId: {
    _id: string;
    installmentNumber: number;
    dueDate: string;
    status: string;
    amount: number;
    loanId: string; // Added loanId to PopulatedCollection
  };
  collectorId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

// API Service Class
class ApiService {
  private token: string | null = null;

  // Initialize token from storage
  async initialize() {
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('API Service - Initialized with token:', this.token ? 'Present' : 'Missing');
  }

  // Refresh token from storage (useful when token is updated by auth service)
  async refreshToken() {
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('API Service - Token refreshed:', this.token ? 'Present' : 'Missing');
  }

  // Get auth headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    console.log('API Service - Current token:', this.token ? 'Present' : 'Missing');
    console.log('API Service - Token value:', this.token);
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    console.log('API Service - Final headers:', headers);
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

    console.log('API Request - URL:', url);
    console.log('API Request - Method:', options.method || 'GET');
    console.log('API Request - Body:', options.body);

    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('API Response - Status:', response.status);
      console.log('API Response - OK:', response.ok);
      
      const data = await response.json();
      console.log('API Response - Data:', data);
      
      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server not responding');
        }
        if (error.message.includes('Network request failed')) {
          throw new Error('Network request failed - check if server is running and API URL is correct');
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
    console.log('API Service - Creating loan with data:', data);
    console.log('API Service - Request URL:', `${API_BASE_URL}/loans`);
    console.log('API Service - Headers:', this.getHeaders());
    
    const response = await this.request<Loan>('/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('API Service - Response received:', response);
    return response;
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

  // Installments
  async getInstallments(loanId: string): Promise<ApiResponse<Installment[]>> {
    return this.request<Installment[]>(`/loans/${loanId}/installments`);
  }

  async getInstallment(id: string): Promise<ApiResponse<Installment>> {
    return this.request<Installment>(`/installments/${id}`);
  }

  // Collections
  async getCollections(params?: {
    page?: number;
    limit?: number;
    collectorId?: string;
    installmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PopulatedCollection[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.collectorId) searchParams.append('collectorId', params.collectorId);
    if (params?.installmentId) searchParams.append('installmentId', params.installmentId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const endpoint = `/collections${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<PopulatedCollection[]>(endpoint);
  }

  async getCollectionsByLoan(loanId: string): Promise<ApiResponse<PopulatedCollection[]>> {
    try {
      // First, get all installments for this loan
      const installmentsResponse = await this.getInstallments(loanId);
      if (!installmentsResponse.success) {
        return { success: false, data: [], error: 'Failed to get installments' };
      }

      const installmentIds = installmentsResponse.data.map(inst => inst._id);
      if (installmentIds.length === 0) {
        return { success: true, data: [] };
      }

      // Get collections for each installment individually but with better error handling
      const allCollections: PopulatedCollection[] = [];
      
      // Use Promise.all to fetch all collections in parallel for better performance
      const collectionPromises = installmentIds.map(async (installmentId) => {
        try {
          const response = await this.getCollections({ installmentId, limit: 50 });
          return response.success ? response.data : [];
        } catch (error) {
          console.error(`Error fetching collections for installment ${installmentId}:`, error);
          return [];
        }
      });

      const collectionResults = await Promise.all(collectionPromises);
      
      // Flatten all collections into a single array
      collectionResults.forEach(collections => {
        allCollections.push(...collections);
      });
      
      // Sort by payment date (newest first)
      allCollections.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      
      return { success: true, data: allCollections };
    } catch (error) {
      console.error('Error getting collections by loan:', error);
      return { success: false, data: [], error: 'Failed to get collections' };
    }
  }

  async getLoansByBorrower(borrowerId: string): Promise<ApiResponse<Loan[]>> {
    // Get all loans and filter by borrower
    const response = await this.getLoans();
    if (response.success) {
      const borrowerLoans = response.data.filter(loan => loan.borrower._id === borrowerId);
      return { success: true, data: borrowerLoans };
    }
    return { success: false, data: [], error: 'Failed to get loans' };
  }

  async getCollection(id: string): Promise<ApiResponse<PopulatedCollection>> {
    return this.request<PopulatedCollection>(`/collections/${id}`);
  }

  async createCollection(data: CreateCollectionData): Promise<ApiResponse<PopulatedCollection>> {
    return this.request<PopulatedCollection>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, data: Partial<CreateCollectionData>): Promise<ApiResponse<PopulatedCollection>> {
    return this.request<PopulatedCollection>(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/collections/${id}`, {
      method: 'DELETE',
    });
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