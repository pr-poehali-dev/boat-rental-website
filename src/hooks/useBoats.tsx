
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { BoatFilterParams } from '@/types/api.types';
import { BoatType } from '@/data/boats';
import { useToast } from '@/components/ui/use-toast';

export const useBoats = () => {
  const [boats, setBoats] = useState<BoatType[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBoats, setTotalBoats] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Загрузка списка лодок с фильтрацией
  const fetchBoats = useCallback(async (params?: BoatFilterParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.boats.getAll(params);
      
      if (response.success) {
        setBoats(response.data);
        
        // Обновляем метаданные пагинации, если они есть
        if (response.meta) {
          setTotalBoats(response.meta.total || 0);
          setCurrentPage(response.meta.page || 1);
          setTotalPages(response.meta.lastPage || 1);
        }
      } else {
        setError(response.error || 'Ошибка при загрузке данных');
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось загрузить список лодок',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Загрузка одной лодки по ID
  const fetchBoatById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.boats.getById(id);
      
      if (response.success) {
        setSelectedBoat(response.data);
        return response.data;
      } else {
        setError(response.error || 'Ошибка при загрузке данных');
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось загрузить информацию о лодке',
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Создание новой лодки (для админ-панели)
  const createBoat = useCallback(async (data: Partial<BoatType>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.boats.create(data);
      
      if (response.success) {
        toast({
          title: 'Успешно',
          description: 'Лодка успешно создана',
        });
        return response.data;
      } else {
        setError(response.error || 'Ошибка при создании');
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось создать лодку',
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Обновление лодки (для админ-панели)
  const updateBoat = useCallback(async (id: number, data: Partial<BoatType>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.boats.update(id, data);
      
      if (response.success) {
        // Обновляем выбранную лодку, если это она
        if (selectedBoat && selectedBoat.id === id) {
          setSelectedBoat(response.data);
        }
        
        // Обновляем лодку в списке, если она там есть
        setBoats(prevBoats => 
          prevBoats.map(boat => boat.id === id ? response.data : boat)
        );
        
        toast({
          title: 'Успешно',
          description: 'Лодка успешно обновлена',
        });
        
        return response.data;
      } else {
        setError(response.error || 'Ошибка при обновлении');
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось обновить лодку',
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedBoat, toast]);

  // Удаление лодки (для админ-панели)
  const deleteBoat = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.boats.delete(id);
      
      if (response.success) {
        // Удаляем лодку из списка
        setBoats(prevBoats => prevBoats.filter(boat => boat.id !== id));
        
        // Сбрасываем выбранную лодку, если это она
        if (selectedBoat && selectedBoat.id === id) {
          setSelectedBoat(null);
        }
        
        toast({
          title: 'Успешно',
          description: 'Лодка успешно удалена',
        });
        
        return true;
      } else {
        setError(response.error || 'Ошибка при удалении');
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось удалить лодку',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedBoat, toast]);

  return {
    boats,
    selectedBoat,
    loading,
    error,
    totalBoats,
    currentPage,
    totalPages,
    fetchBoats,
    fetchBoatById,
    createBoat,
    updateBoat,
    deleteBoat,
  };
};
