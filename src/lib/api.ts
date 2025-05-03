
import { ApiResponse, LoginRequest, RegisterRequest, BoatFilterParams, BookingRequest } from '@/types/api.types';
import { BoatType } from '@/data/boats';
import { boats as boatsData } from '@/data/boats';

// Имитация задержки для эмуляции API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для получения токена из localStorage
const getToken = () => localStorage.getItem('auth_token');

// Базовый URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Класс для работы с API
class Api {
  // API для лодок
  boats = {
    // Получение всех лодок с фильтрацией
    getAll: async (params?: BoatFilterParams): Promise<ApiResponse<BoatType[]>> => {
      try {
        await delay(500); // Задержка для имитации запроса

        // Фильтрация лодок
        let filtered = [...boatsData];

        // Поиск по названию или описанию
        if (params?.search) {
          const search = params.search.toLowerCase();
          filtered = filtered.filter(boat => 
            boat.name.toLowerCase().includes(search) || 
            boat.description.toLowerCase().includes(search)
          );
        }

        // Фильтрация по категориям
        if (params?.category && params.category.length > 0) {
          filtered = filtered.filter(boat => 
            boat.categories.some(category => params.category?.includes(category))
          );
        }

        // Фильтрация по цене
        if (params?.minPrice !== undefined) {
          filtered = filtered.filter(boat => boat.price >= (params.minPrice || 0));
        }
        if (params?.maxPrice !== undefined) {
          filtered = filtered.filter(boat => boat.price <= params.maxPrice!);
        }

        // Фильтрация по вместимости
        if (params?.minCapacity !== undefined) {
          filtered = filtered.filter(boat => boat.capacity >= (params.minCapacity || 0));
        }

        // Сортировка
        if (params?.sortBy) {
          switch (params.sortBy) {
            case 'popular':
              filtered.sort((a, b) => b.rating - a.rating);
              break;
            case 'priceAsc':
              filtered.sort((a, b) => a.price - b.price);
              break;
            case 'priceDesc':
              filtered.sort((a, b) => b.price - a.price);
              break;
            case 'newest':
              // В данной реализации у нас нет даты создания, поэтому используем ID как суррогат
              filtered.sort((a, b) => b.id - a.id);
              break;
          }
        }

        // Пагинация
        const page = params?.page || 1;
        const perPage = params?.perPage || 10;
        const startIndex = (page - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, filtered.length);
        const paginatedBoats = filtered.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedBoats,
          meta: {
            total: filtered.length,
            page,
            perPage,
            lastPage: Math.ceil(filtered.length / perPage),
          },
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: [],
          error: 'Произошла ошибка при получении списка лодок',
        };
      }
    },

    // Получение лодки по ID
    getById: async (id: number): Promise<ApiResponse<BoatType>> => {
      try {
        await delay(300);
        
        const boat = boatsData.find(boat => boat.id === id);
        
        if (!boat) {
          return {
            success: false,
            data: {} as BoatType,
            error: 'Лодка не найдена',
          };
        }
        
        return {
          success: true,
          data: boat,
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {} as BoatType,
          error: 'Произошла ошибка при получении информации о лодке',
        };
      }
    },

    // Создание новой лодки
    create: async (data: Partial<BoatType>): Promise<ApiResponse<BoatType>> => {
      try {
        await delay(700);
        
        // В реальном API здесь был бы запрос POST
        const newBoat: BoatType = {
          id: Date.now(),
          name: data.name || 'Новая лодка',
          description: data.description || 'Описание отсутствует',
          price: data.price || 0,
          imageUrl: data.imageUrl || '',
          capacity: data.capacity || 1,
          length: data.length || 1,
          categories: data.categories || [],
          rating: 0,
          reviews: [],
          features: data.features || [],
        };
        
        // В реальном API лодка добавлялась бы в базу данных
        // Здесь мы добавляем новую лодку в существующий массив
        boatsData.push(newBoat);
        
        return {
          success: true,
          data: newBoat,
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {} as BoatType,
          error: 'Произошла ошибка при создании лодки',
        };
      }
    },

    // Обновление существующей лодки
    update: async (id: number, data: Partial<BoatType>): Promise<ApiResponse<BoatType>> => {
      try {
        await delay(700);
        
        const boatIndex = boatsData.findIndex(boat => boat.id === id);
        
        if (boatIndex === -1) {
          return {
            success: false,
            data: {} as BoatType,
            error: 'Лодка не найдена',
          };
        }
        
        // Обновляем данные лодки
        const updatedBoat = {
          ...boatsData[boatIndex],
          ...data,
        };
        
        // В реальном API данные обновлялись бы в базе данных
        boatsData[boatIndex] = updatedBoat;
        
        return {
          success: true,
          data: updatedBoat,
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {} as BoatType,
          error: 'Произошла ошибка при обновлении лодки',
        };
      }
    },

    // Удаление лодки
    delete: async (id: number): Promise<ApiResponse<{ id: number }>> => {
      try {
        await delay(500);
        
        const boatIndex = boatsData.findIndex(boat => boat.id === id);
        
        if (boatIndex === -1) {
          return {
            success: false,
            data: { id },
            error: 'Лодка не найдена',
          };
        }
        
        // В реальном API лодка удалялась бы из базы данных
        boatsData.splice(boatIndex, 1);
        
        return {
          success: true,
          data: { id },
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: { id },
          error: 'Произошла ошибка при удалении лодки',
        };
      }
    },
  };

  // API для бронирований
  bookings = {
    // Создание нового бронирования
    create: async (data: BookingRequest): Promise<ApiResponse<any>> => {
      try {
        await delay(800);
        
        // В реальном API здесь был бы запрос POST
        const newBooking = {
          id: Date.now(),
          ...data,
          status: 'pending',
          totalPrice: 0, // В реальном API цена рассчитывалась бы на сервере
          createdAt: new Date().toISOString(),
        };
        
        return {
          success: true,
          data: newBooking,
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {},
          error: 'Произошла ошибка при создании бронирования',
        };
      }
    },

    // Проверка доступности лодки на указанные даты
    checkAvailability: async (boatId: number, startDate: string, endDate: string): Promise<ApiResponse<{ available: boolean }>> => {
      try {
        await delay(400);
        
        // В реальном API здесь была бы проверка доступности в базе данных
        // Для демо: лодка считается доступной с вероятностью 80%
        const available = Math.random() > 0.2;
        
        return {
          success: true,
          data: { available },
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: { available: false },
          error: 'Произошла ошибка при проверке доступности',
        };
      }
    },

    // Получение всех бронирований (для админ-панели)
    getAll: async (): Promise<ApiResponse<any[]>> => {
      try {
        await delay(600);
        
        // В реальном API здесь был бы запрос GET
        // и данные брались бы из базы данных
        const bookings = [
          {
            id: 1,
            boatId: 1,
            userId: 1,
            startDate: '2023-05-10',
            endDate: '2023-05-15',
            status: 'confirmed',
            totalPrice: 25000,
            createdAt: '2023-05-01T10:30:00Z',
            clientName: 'Иван Иванов',
            clientEmail: 'ivan@example.com',
            clientPhone: '+7 901 123-45-67',
          },
          {
            id: 2,
            boatId: 3,
            userId: 2,
            startDate: '2023-05-20',
            endDate: '2023-05-22',
            status: 'pending',
            totalPrice: 12000,
            createdAt: '2023-05-05T14:20:00Z',
            clientName: 'Анна Смирнова',
            clientEmail: 'anna@example.com',
            clientPhone: '+7 902 987-65-43',
          },
          {
            id: 3,
            boatId: 2,
            userId: 3,
            startDate: '2023-05-18',
            endDate: '2023-05-19',
            status: 'cancelled',
            totalPrice: 5000,
            createdAt: '2023-05-03T09:45:00Z',
            clientName: 'Петр Петров',
            clientEmail: 'petr@example.com',
            clientPhone: '+7 903 456-78-90',
          },
        ];
        
        return {
          success: true,
          data: bookings,
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: [],
          error: 'Произошла ошибка при получении списка бронирований',
        };
      }
    },

    // Обновление статуса бронирования
    updateStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
      try {
        await delay(500);
        
        // В реальном API здесь был бы запрос PATCH/PUT
        return {
          success: true,
          data: { id, status },
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {},
          error: 'Произошла ошибка при обновлении статуса бронирования',
        };
      }
    },
  };

  // API для аутентификации
  auth = {
    // Вход в систему
    login: async (data: LoginRequest): Promise<ApiResponse<any>> => {
      try {
        await delay(600);
        
        // В реальном API здесь была бы проверка учетных данных в базе
        // и выдача токена
        if (data.email === 'admin@example.com' && data.password === 'password') {
          const userData = {
            id: 1,
            name: 'Администратор',
            email: data.email,
            role: 'admin',
            createdAt: '2023-01-01T00:00:00Z',
          };
          
          const token = 'fake_token_' + Date.now();
          
          // Сохраняем токен в localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          
          return {
            success: true,
            data: {
              user: userData,
              token,
            },
          };
        } else if (data.email === 'user@example.com' && data.password === 'password') {
          const userData = {
            id: 2,
            name: 'Тестовый пользователь',
            email: data.email,
            role: 'user',
            createdAt: '2023-01-02T00:00:00Z',
          };
          
          const token = 'fake_token_' + Date.now();
          
          // Сохраняем токен в localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          
          return {
            success: true,
            data: {
              user: userData,
              token,
            },
          };
        }
        
        return {
          success: false,
          data: {},
          error: 'Неверный email или пароль',
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {},
          error: 'Произошла ошибка при входе в систему',
        };
      }
    },

    // Регистрация
    register: async (data: RegisterRequest): Promise<ApiResponse<any>> => {
      try {
        await delay(800);
        
        // В реальном API здесь была бы проверка уникальности email
        // и создание новой учетной записи
        if (data.email === 'admin@example.com' || data.email === 'user@example.com') {
          return {
            success: false,
            data: {},
            error: 'Пользователь с таким email уже существует',
          };
        }
        
        const userData = {
          id: Date.now(),
          name: data.name,
          email: data.email,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        
        const token = 'fake_token_' + Date.now();
        
        // Сохраняем токен в localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        return {
          success: true,
          data: {
            user: userData,
            token,
          },
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {},
          error: 'Произошла ошибка при регистрации',
        };
      }
    },

    // Проверка токена и получение данных пользователя
    me: async (): Promise<ApiResponse<any>> => {
      try {
        await delay(300);
        
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');
        
        if (!token || !userData) {
          return {
            success: false,
            data: {},
            error: 'Не авторизован',
          };
        }
        
        return {
          success: true,
          data: {
            user: JSON.parse(userData),
          },
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {},
          error: 'Произошла ошибка при получении данных пользователя',
        };
      }
    },

    // Выход из системы
    logout: async (): Promise<ApiResponse<any>> => {
      try {
        await delay(200);
        
        // Удаляем токен из localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        return {
          success: true,
          data: {},
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: {},
          error: 'Произошла ошибка при выходе из системы',
        };
      }
    },
  };

  // API для пользователей (для админ-панели)
  users = {
    // Получение всех пользователей
    getAll: async (): Promise<ApiResponse<any[]>> => {
      try {
        await delay(700);
        
        // В реальном API здесь был бы запрос GET
        // и данные брались бы из базы данных
        const users = [
          {
            id: 1,
            name: 'Администратор',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: '2023-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Тестовый пользователь',
            email: 'user@example.com',
            role: 'user',
            createdAt: '2023-01-02T00:00:00Z',
          },
          {
            id: 3,
            name: 'Иван Иванов',
            email: 'ivan@example.com',
            role: 'user',
            createdAt: '2023-02-15T10:30:00Z',
          },
        ];
        
        return {
          success: true,
          data: users,
        };
      } catch (error) {
        console.error('API Error:', error);
        return {
          success: false,
          data: [],
          error: 'Произошла ошибка при получении списка пользователей',
        };
      }
    },
  };
}

// Экспортируем экземпляр класса Api
export const api = new Api();
