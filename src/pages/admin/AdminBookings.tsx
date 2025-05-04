
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import BookingExport from "@/components/admin/BookingExport";

// Статусы бронирований
const BOOKING_STATUSES = [
  { value: "all", label: "Все статусы" },
  { value: "pending", label: "Ожидает" },
  { value: "confirmed", label: "Подтверждено" },
  { value: "cancelled", label: "Отменено" },
  { value: "completed", label: "Завершено" }
];

const AdminBookings = () => {
  // Состояние для фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExport, setShowExport] = useState(false);

  // Получение данных о бронированиях
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.bookings.getAll();
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при загрузке бронирований');
      }
      return response.data;
    }
  });

  // Фильтрация бронирований
  const filteredBookings = bookings.filter((booking: any) => {
    // Фильтр по поисковому запросу
    const matchesSearch = searchQuery === "" || 
      booking.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.boatName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id?.toString().includes(searchQuery);
    
    // Фильтр по статусу
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Функция для получения названия статуса на русском
  const getStatusLabel = (status: string) => {
    const statusObj = BOOKING_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  return (
    <div className="space-y-6">
      {showExport ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Экспорт бронирований</h2>
            <Button variant="outline" onClick={() => setShowExport(false)}>
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              Вернуться к списку
            </Button>
          </div>
          <BookingExport />
        </>
      ) : (
        <>
          {/* Заголовок и кнопки */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Управление бронированиями</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowExport(true)}>
                <Icon name="FileDown" className="mr-2" size={16} />
                Экспорт данных
              </Button>
            </div>
          </div>
          
          {/* Фильтры */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Поиск по имени, email, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    icon="Search"
                  />
                </div>
                
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Фильтр по статусу" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOKING_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Список бронирований */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Все бронирования</TabsTrigger>
              <TabsTrigger value="pending">Ожидающие</TabsTrigger>
              <TabsTrigger value="confirmed">Подтвержденные</TabsTrigger>
              <TabsTrigger value="completed">Завершенные</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Загрузка данных...
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Клиент</th>
                        <th className="p-3 text-left">Лодка</th>
                        <th className="p-3 text-left">Период</th>
                        <th className="p-3 text-left">Сумма</th>
                        <th className="p-3 text-left">Статус</th>
                        <th className="p-3 text-center">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking: any) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{booking.id}</td>
                          <td className="p-3">
                            <div className="font-medium">{booking.clientName}</div>
                            <div className="text-sm text-muted-foreground">{booking.clientEmail}</div>
                          </td>
                          <td className="p-3">{booking.boatName}</td>
                          <td className="p-3 whitespace-nowrap">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </td>
                          <td className="p-3 font-medium">{booking.totalPrice.toLocaleString()} ₽</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <Button variant="ghost" size="icon" title="Просмотр">
                                <Icon name="Eye" size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" title="Редактировать">
                                <Icon name="Pencil" size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <Icon name="FileSearch" size={40} className="mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Бронирования не найдены</h3>
                  <p className="text-muted-foreground">Попробуйте изменить параметры фильтрации</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              {/* Содержимое для вкладки "Ожидающие" */}
              {/* Аналогично вкладке "all", но с предустановленным фильтром */}
            </TabsContent>
            
            <TabsContent value="confirmed" className="mt-4">
              {/* Содержимое для вкладки "Подтвержденные" */}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              {/* Содержимое для вкладки "Завершенные" */}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AdminBookings;
