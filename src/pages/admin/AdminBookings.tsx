
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Booking } from "@/types/api.types";
import Icon from "@/components/ui/icon";
import { useBoats } from "@/hooks/useBoats";

// Статусы бронирований и их цвета
const BOOKING_STATUSES = {
  pending: { label: "Ожидает подтверждения", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Подтверждено", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Отменено", color: "bg-red-100 text-red-800" },
  completed: { label: "Завершено", color: "bg-blue-100 text-blue-800" }
};

export default function AdminBookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Получение списка бронирований
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.bookings.getAll();
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при загрузке бронирований');
      }
      return response.data;
    }
  });

  // Получение лодок для отображения информации
  const { boats } = useBoats();

  // Мутация для обновления статуса бронирования
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return api.bookings.updateStatus(id, status);
    },
    onSuccess: () => {
      toast({
        title: "Статус обновлен",
        description: "Статус бронирования успешно обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setIsDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить статус",
        variant: "destructive",
      });
    }
  });

  // Обработчик обновления статуса
  const handleUpdateStatus = (status: string) => {
    if (!selectedBooking) return;
    updateStatusMutation.mutate({ id: selectedBooking.id, status });
  };

  // Фильтрация бронирований
  const filteredBookings = bookingsData ? bookingsData.filter((booking: Booking) => {
    const matchesSearch = searchQuery === "" || 
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.clientPhone && booking.clientPhone.includes(searchQuery));
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Функция для получения названия лодки по идентификатору
  const getBoatName = (boatId: number) => {
    const boat = boats.find(b => b.id === boatId);
    return boat ? boat.name : `Лодка #${boatId}`;
  };

  // Функция для форматирования даты
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: ru });
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Произошла ошибка при загрузке бронирований"}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Все бронирования</TabsTrigger>
            <TabsTrigger value="pending">Ожидающие</TabsTrigger>
            <TabsTrigger value="confirmed">Подтвержденные</TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                placeholder="Поиск бронирований..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="md:w-60"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full" 
                  onClick={() => setSearchQuery("")}
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
            
            <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидающие</SelectItem>
                <SelectItem value="confirmed">Подтвержденные</SelectItem>
                <SelectItem value="cancelled">Отмененные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-6">
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Загрузка бронирований...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center p-6">
                  <Icon name="Calendar" className="mx-auto mb-2" size={32} />
                  <h3 className="text-lg font-medium">Бронирования не найдены</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter
                      ? "Попробуйте изменить параметры поиска или фильтры"
                      : "Пока нет бронирований в системе"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Лодка</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Даты</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking: Booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{getBoatName(booking.boatId)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.clientName}</div>
                            <div className="text-xs text-muted-foreground">{booking.clientEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(booking.startDate)}</div>
                            <div>{formatDate(booking.endDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={BOOKING_STATUSES[booking.status as keyof typeof BOOKING_STATUSES].color}>
                            {BOOKING_STATUSES[booking.status as keyof typeof BOOKING_STATUSES].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{booking.totalPrice.toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Icon name="Eye" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Заглушки для других вкладок */}
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p>Здесь будут отображаться ожидающие бронирования</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="confirmed">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p>Здесь будут отображаться подтвержденные бронирования</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p>Здесь будут отображаться завершенные бронирования</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог с подробной информацией о бронировании */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Информация о бронировании #{selectedBooking?.id}</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Лодка</h4>
                  <p className="font-medium">{getBoatName(selectedBooking.boatId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Статус</h4>
                  <Badge className={BOOKING_STATUSES[selectedBooking.status as keyof typeof BOOKING_STATUSES].color}>
                    {BOOKING_STATUSES[selectedBooking.status as keyof typeof BOOKING_STATUSES].label}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Дата начала</h4>
                  <p>{formatDate(selectedBooking.startDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Дата окончания</h4>
                  <p>{formatDate(selectedBooking.endDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Стоимость</h4>
                  <p className="font-medium">{selectedBooking.totalPrice.toLocaleString()} ₽</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Дата бронирования</h4>
                  <p>{formatDate(selectedBooking.createdAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Информация о клиенте</h4>
                <div className="bg-muted p-3 rounded-md">
                  <div className="space-y-1">
                    <p className="font-medium">{selectedBooking.clientName}</p>
                    <p className="text-sm">Email: {selectedBooking.clientEmail}</p>
                    {selectedBooking.clientPhone && (
                      <p className="text-sm">Телефон: {selectedBooking.clientPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedBooking.comments && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Комментарии</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedBooking.comments}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Изменить статус</h4>
                <div className="flex gap-2 flex-wrap">
                  {(selectedBooking.status === "pending" || selectedBooking.status === "cancelled") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                      onClick={() => handleUpdateStatus("confirmed")}
                    >
                      <Icon name="Check" className="mr-1" size={14} />
                      Подтвердить
                    </Button>
                  )}
                  
                  {selectedBooking.status === "pending" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => handleUpdateStatus("cancelled")}
                    >
                      <Icon name="X" className="mr-1" size={14} />
                      Отменить
                    </Button>
                  )}
                  
                  {selectedBooking.status === "confirmed" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      onClick={() => handleUpdateStatus("completed")}
                    >
                      <Icon name="CheckCheck" className="mr-1" size={14} />
                      Завершить
                    </Button>
                  )}
                  
                  {selectedBooking.status === "confirmed" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => handleUpdateStatus("cancelled")}
                    >
                      <Icon name="X" className="mr-1" size={14} />
                      Отменить
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
