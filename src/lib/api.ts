
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types/api.types';

// Создаем константы для работы с токеном авторизации
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Настройка базового URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Создаем экземпляр axios с базовыми настройками
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Обработка ошибки авторизации (401)
    if (error.response?.status === 401) {
      // Очищаем локальное хранилище при истечении сессии
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      // Перенаправление на страницу логина можно реализовать здесь
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Обобщенная функция для выполнения запросов к API
async function apiRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      return {
        data: {} as T,
        success: false,
        error: errorMessage,
      };
    }
    return {
      data: {} as T,
      success: false,
      error: 'Произошла неизвестная ошибка',
    };
  }
}

// Функции для работы с аутентификацией
export const authService = {
  // Логин пользователя
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });

    if (response.success && response.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
    }

    return response;
  },

  // Регистрация пользователя
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    });

    if (response.success && response.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
    }

    return response;
  },

  // Выход пользователя
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Ошибка при выходе', error);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    }
  },

  // Проверка, авторизован ли пользователь
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Получение данных текущего пользователя
  getCurrentUser(): import('@/types/api.types').User | null {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Проверка, является ли пользователь администратором
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

// Экспорт основного объекта API для использования в приложении
export const api = {
  auth: authService,
  
  // Функции для работы с лодками
  boats: {
    // Получение списка лодок с фильтрацией
    async getAll(params?: import('@/types/api.types').BoatFilterParams): Promise<ApiResponse<import('@/data/boats').BoatType[]>> {
      return await apiRequest<import('@/data/boats').BoatType[]>({
        method: 'GET',
        url: '/boats',
        params,
      });
    },

    // Получение конкретной лодки по ID
    async getById(id: number): Promise<ApiResponse<import('@/data/boats').BoatType>> {
      return await apiRequest<import('@/data/boats').BoatType>({
        method: 'GET',
        url: `/boats/${id}`,
      });
    },

    // Для админ-панели: создание новой лодки
    async create(data: Partial<import('@/data/boats').BoatType>): Promise<ApiResponse<import('@/data/boats').BoatType>> {
      return await apiRequest<import('@/data/boats').BoatType>({
        method: 'POST',
        url: '/boats',
        data,
      });
    },

    // Для админ-панели: обновление лодки
    async update(id: number, data: Partial<import('@/data/boats').BoatType>): Promise<ApiResponse<import('@/data/boats').BoatType>> {
      return await apiRequest<import('@/data/boats').BoatType>({
        method: 'PUT',
        url: `/boats/${id}`,
        data,
      });
    },

    // Для админ-панели: удаление лодки
    async delete(id: number): Promise<ApiResponse<void>> {
      return await apiRequest<void>({
        method: 'DELETE',
        url: `/boats/${id}`,
      });
    },
  },

  // Функции для работы с бронированиями
  bookings: {
    // Создание нового бронирования
    async create(data: import('@/types/api.types').BookingRequest): Promise<ApiResponse<import('@/types/api.types').Booking>> {
      return await apiRequest<import('@/types/api.types').Booking>({
        method: 'POST',
        url: '/bookings',
        data,
      });
    },

    // Получение списка бронирований (для админ-панели или личного кабинета)
    async getAll(params?: import('@/types/api.types').PaginationParams): Promise<ApiResponse<import('@/types/api.types').Booking[]>> {
      return await apiRequest<import('@/types/api.types').Booking[]>({
        method: 'GET',
        url: '/bookings',
        params,
      });
    },

    // Получение конкретного бронирования по ID
    async getById(id: number): Promise<ApiResponse<import('@/types/api.types').Booking>> {
      return await apiRequest<import('@/types/api.types').Booking>({
        method: 'GET',
        url: `/bookings/${id}`,
      });
    },

    // Обновление статуса бронирования (для админ-панели)
    async updateStatus(id: number, status: import('@/types/api.types').Booking['status']): Promise<ApiResponse<import('@/types/api.types').Booking>> {
      return await apiRequest<import('@/types/api.types').Booking>({
        method: 'PATCH',
        url: `/bookings/${id}/status`,
        data: { status },
      });
    },

    // Отмена бронирования
    async cancel(id: number): Promise<ApiResponse<import('@/types/api.types').Booking>> {
      return await apiRequest<import('@/types/api.types').Booking>({
        method: 'PATCH',
        url: `/bookings/${id}/cancel`,
      });
    },

    // Проверка доступности лодки в указанные даты
    async checkAvailability(boatId: number, startDate: string, endDate: string): Promise<ApiResponse<{ available: boolean }>> {
      return await apiRequest<{ available: boolean }>({
        method: 'GET',
        url: `/bookings/check-availability`,
        params: { boatId, startDate, endDate },
      });
    },
  },
};

export default api;
