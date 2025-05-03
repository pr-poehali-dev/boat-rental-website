
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    lastPage?: number;
  };
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface BoatFilterParams extends PaginationParams {
  search?: string;
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  sortBy?: 'popular' | 'priceAsc' | 'priceDesc' | 'newest';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BookingRequest {
  boatId: number;
  startDate: string;
  endDate: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  comments?: string;
}

export interface Booking {
  id: number;
  boatId: number;
  userId?: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  comments?: string;
  boat?: import('@/data/boats').BoatType;
}
