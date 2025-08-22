import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ChatSession {
  id: string;
  title: string;
  is_favorite: boolean;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session: string;
  sender: 'user' | 'assistant';
  content: string;
  document_category?: string;
  rag_context?: any[];
  rag_sources?: any[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  source_url?: string;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateSessionRequest {
  title: string;
}

export interface SendMessageRequest {
  content: string;
  document_category?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  category: string;
  source_url?: string;
}

// API Service Class
class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:8000/api/v1';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Adding auth header for:', config.url);
        } else {
          console.log('No auth token found for:', config.url);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<{ access: string; refresh: string }> {
    console.log('Attempting login with credentials:', credentials);
    
    try {
      const response: AxiosResponse<{ access: string; refresh: string }> = 
        await this.api.post('/token/', credentials);
      
      console.log('Login response:', response.data);
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    console.log('Attempting registration with data:', userData);
    
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await this.api.post('/register/', userData);
      
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async getUserProfile(): Promise<User> {
    console.log('Getting user profile...');
    
    try {
      const response: AxiosResponse<User> = 
        await this.api.get('/profile/');
      
      console.log('User profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token available');
    
    const response: AxiosResponse<{ access: string }> = 
      await this.api.post('/token/refresh/', { refresh });
    
    localStorage.setItem('access_token', response.data.access);
    return response.data;
  }

  // Chat Session APIs
  async getChatSessions(): Promise<ApiResponse<ChatSession[]>> {
    console.log('Getting chat sessions...');
    
    try {
      const response: AxiosResponse<ApiResponse<ChatSession[]>> = 
        await this.api.get('/sessions/');
      
      console.log('Chat sessions response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get chat sessions error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async createChatSession(sessionData: CreateSessionRequest): Promise<ApiResponse<ChatSession>> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = 
      await this.api.post('/sessions/', sessionData);
    return response.data;
  }

  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = 
      await this.api.get(`/sessions/${sessionId}/`);
    return response.data;
  }

  async updateChatSession(sessionId: string, sessionData: Partial<CreateSessionRequest>): Promise<ApiResponse<ChatSession>> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = 
      await this.api.put(`/sessions/${sessionId}/`, sessionData);
    return response.data;
  }

  async renameChatSession(sessionId: string, newTitle: string): Promise<ApiResponse<ChatSession>> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = 
      await this.api.patch(`/sessions/${sessionId}/rename/`, { title: newTitle });
    return response.data;
  }

  async toggleChatSessionFavorite(sessionId: string): Promise<ApiResponse<ChatSession>> {
    const response: AxiosResponse<ApiResponse<ChatSession>> = 
      await this.api.patch(`/sessions/${sessionId}/favorite/`, {});
    return response.data;
  }

  async deleteChatSession(sessionId: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = 
      await this.api.delete(`/sessions/${sessionId}/`);
    return response.data;
  }

  // Chat Message APIs (with integrated RAG)
  async getSessionMessages(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    const response: AxiosResponse<ApiResponse<ChatMessage[]>> = 
      await this.api.get(`/sessions/${sessionId}/messages/`);
    return response.data;
  }

  async sendMessage(sessionId: string, messageData: SendMessageRequest): Promise<ApiResponse<ChatMessage>> {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = 
      await this.api.post(`/sessions/${sessionId}/messages/`, messageData);
    return response.data;
  }

  // Document APIs
  async getDocuments(): Promise<ApiResponse<Document[]>> {
    const response: AxiosResponse<ApiResponse<Document[]>> = 
      await this.api.get('/documents/');
    return response.data;
  }

  async createDocument(documentData: CreateDocumentRequest): Promise<ApiResponse<Document>> {
    const response: AxiosResponse<ApiResponse<Document>> = 
      await this.api.post('/documents/', documentData);
    return response.data;
  }

  async getDocument(documentId: string): Promise<ApiResponse<Document>> {
    const response: AxiosResponse<ApiResponse<Document>> = 
      await this.api.get(`/documents/${documentId}/`);
    return response.data;
  }

  async updateDocument(documentId: string, documentData: Partial<CreateDocumentRequest>): Promise<ApiResponse<Document>> {
    const response: AxiosResponse<ApiResponse<Document>> = 
      await this.api.put(`/documents/${documentId}/`, documentData);
    return response.data;
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = 
      await this.api.delete(`/documents/${documentId}/`);
    return response.data;
  }

  // Document Categories API
  async getDocumentCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    const response: AxiosResponse<ApiResponse<{ categories: string[] }>> = 
      await this.api.get('/documents/categories/');
    return response.data;
  }

  // Document Search API
  async searchDocuments(query: string, category?: string, limit?: number): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());
    
    const response: AxiosResponse<ApiResponse<Document[]>> = 
      await this.api.get(`/documents/search/?${params.toString()}`);
    return response.data;
  }

  // RAG Query API
  async processRAGQuery(query: string, documentCategory?: string, conversationHistory?: any[]): Promise<ApiResponse<any>> {
    const requestData: any = { query };
    if (documentCategory) requestData.document_category = documentCategory;
    if (conversationHistory) requestData.conversation_history = conversationHistory;
    
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/query/', requestData);
    return response.data;
  }

  // RAG History API
  async getRAGHistory(page?: number, pageSize?: number, documentCategory?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (documentCategory) params.append('document_category', documentCategory);
    
    const response: AxiosResponse<ApiResponse<any[]>> = 
      await this.api.get(`/queries/history/?${params.toString()}`);
    return response.data;
  }

  // Utility methods
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
