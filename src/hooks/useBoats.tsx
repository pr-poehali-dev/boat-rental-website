
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BoatFilterParams } from '@/types/api.types';
import { BoatType } from '@/data/boats';
import { useToast } from '@/components/ui/use-toast';

// Ключи для кэширования запросов
const QUERY_KEYS = {
  ALL_BOATS: 'boats',
  BOAT_DETAILS: 'boat-details',
  POPULAR_BOATS: 'popular-boats',
  FEATURED_BOATS: 'featured-boats',
};

export const useBoats = (initialParams?: BoatFilterParams) => {
  const [filterParams, setFilterParams] = useState<BoatFilterParams>(initialParams || {});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Получение списка лодок с использованием React Query
  const {
    data: boatsData,
    isLoading: isLoadingBoats,
    error: boatsError,
    refetch: refetchBoats,
  } = useQuery({
    queryKey: [QUERY_KEYS.ALL_BOATS, filterParams],
    queryFn: async () => {
      const response = await api.boats.getAll(filterParams);
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при загрузке списка лодок');
      }
      return {
        boats: response.data,
        meta: response.meta || {},
      };
    },
    enabled: true, // Запрос выполняется автоматически при монтировании компонента
  });

  // Хук для получения конкретной лодки по ID
  const useBoatDetails = (id?: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.BOAT_DETAILS, id],
      queryFn: async () => {
        if (!id) return null;
        const response = await api.boats.getById(id);
        if (!response.success) {
          throw new Error(response.error || 'Ошибка при загрузке информации о лодке');
        }
        return response.data;
      },
      enabled: !!id, // Запрос выполняется только если есть ID
    });
  };

  // Мутация для создания новой лодки
  const createBoatMutation = useMutation({
    mutationFn: async (data: Partial<BoatType>) => {
      const response = await api.boats.create(data);
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при создании лодки');
      }
      return response.data;
    },
    onSuccess: () => {
      // Инвалидируем кэш после успешного создания
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_BOATS] });
      toast({
        title: 'Успешно',
        description: 'Лодка успешно создана',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать лодку',
        variant: 'destructive',
      });
    },
  });

  // Мутация для обновления лодки
  const updateBoatMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BoatType> }) => {
      const response = await api.boats.update(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при обновлении лодки');
      }
      return response.data;
    },
    onSuccess: (updatedBoat) => {
      // Инвалидируем кэш конкретной лодки и общий список
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOAT_DETAILS, updatedBoat.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_BOATS] });
      toast({
        title: 'Успешно',
        description: 'Лодка успешно обновлена',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить лодку',
        variant: 'destructive',
      });
    },
  });

  // Мутация для удаления лодки
  const deleteBoatMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.boats.delete(id);
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при удалении лодки');
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Инвалидируем кэш после успешного удаления
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_BOATS] });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.BOAT_DETAILS, deletedId] });
      toast({
        title: 'Успешно',
        description: 'Лодка успешно удалена',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить лодку',
        variant: 'destructive',
      });
    },
  });

  // Хук для получения популярных лодок
  const usePopularBoats = (limit = 4) => {
    return useQuery({
      queryKey: [QUERY_KEYS.POPULAR_BOATS, limit],
      queryFn: async () => {
        const response = await api.boats.getAll({ 
          sortBy: 'popular', 
          perPage: limit 
        });
        if (!response.success) {
          throw new Error(response.error || 'Ошибка при загрузке популярных лодок');
        }
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // Кэш действителен в течение 5 минут
    });
  };

  // Хук для получения избранных лодок (например, для главной страницы)
  const useFeaturedBoats = (limit = 3) => {
    return useQuery({
      queryKey: [QUERY_KEYS.FEATURED_BOATS, limit],
      queryFn: async () => {
        // Здесь можно настроить специальные параметры для выборки избранных лодок
        const response = await api.boats.getAll({ 
          perPage: limit,
          // Дополнительная логика выбора избранных лодок может быть добавлена в API
        });
        if (!response.success) {
          throw new Error(response.error || 'Ошибка при загрузке избранных лодок');
        }
        return response.data;
      },
      staleTime: 10 * 60 * 1000, // Кэш действителен в течение 10 минут
    });
  };

  // Проверка доступности лодки для бронирования
  const checkBoatAvailability = useCallback(async (boatId: number, startDate: string, endDate: string) => {
    try {
      const response = await api.bookings.checkAvailability(boatId, startDate, endDate);
      return response.success ? response.data.available : false;
    } catch (error) {
      console.error('Ошибка при проверке доступности:', error);
      return false;
    }
  }, []);

  // Получение категорий лодок для фильтрации
  const getBoatCategories = useCallback(() => {
    const categories = new Set<string>();
    boatsData?.boats.forEach(boat => {
      boat.categories.forEach(category => categories.add(category));
    });
    return Array.from(categories);
  }, [boatsData]);

  // Обновление параметров фильтрации
  const updateFilterParams = useCallback((newParams: Partial<BoatFilterParams>) => {
    setFilterParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Сброс параметров фильтрации
  const resetFilterParams = useCallback(() => {
    setFilterParams({});
  }, []);

  // Вычисление минимальной и максимальной цены для фильтров
  const getPriceRange = useCallback(() => {
    if (!boatsData?.boats.length) return { min: 0, max: 10000 };
    
    let min = Number.MAX_VALUE;
    let max = 0;
    
    boatsData.boats.forEach(boat => {
      if (boat.price < min) min = boat.price;
      if (boat.price > max) max = boat.price;
    });
    
    return { min, max };
  }, [boatsData]);

  return {
    // Данные лодок
    boats: boatsData?.boats || [],
    meta: boatsData?.meta,
    isLoading: isLoadingBoats,
    error: boatsError,
    refetch: refetchBoats,
    
    // Текущие параметры фильтрации
    filterParams,
    updateFilterParams,
    resetFilterParams,
    
    // Вспомогательные функции для фильтрации
    getBoatCategories,
    getPriceRange,
    
    // Хуки для получения конкретных данных
    useBoatDetails,
    usePopularBoats,
    useFeaturedBoats,
    
    // Функции для работы с лодками (CRUD)
    createBoat: createBoatMutation.mutate,
    updateBoat: updateBoatMutation.mutate,
    deleteBoat: deleteBoatMutation.mutate,
    
    // Дополнительный функционал
    checkBoatAvailability,
  };
};
