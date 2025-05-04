
import { useState, useMemo } from "react";
import { format, eachDayOfInterval, addDays, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Icon from "@/components/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Booking } from "@/types/api.types";
import { useBoats } from "@/hooks/useBoats";

// Тип для данных о загруженности лодки
interface OccupancyData {
  boatId: number;
  boatName: string;
  dates: Array<{
    date: Date;
    isBooked: boolean;
    bookingId?: number;
    clientName?: string;
  }>;
  occupancyRate: number; // процент занятости за период
}

// Типы периодов для выбора
type PeriodType = "week" | "month" | "quarter";

const BoatOccupancyChart = () => {
  const { boats } = useBoats();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("month");
  const [selectedBoatId, setSelectedBoatId] = useState<string>("all");
  
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

  // Вычисление дат для выбранного периода
  const dateRange = useMemo(() => {
    const today = new Date();
    let startDate: Date, endDate: Date;
    
    switch (selectedPeriod) {
      case "week":
        startDate = today;
        endDate = addDays(today, 6);
        break;
      case "quarter":
        startDate = today;
        endDate = addDays(today, 90);
        break;
      case "month":
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
    }
    
    return { startDate, endDate };
  }, [selectedPeriod]);

  // Генерация массива дат для отображения
  const daysInRange = useMemo(() => {
    return eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate
    });
  }, [dateRange]);

  // Формирование данных о загруженности лодок
  const occupancyData = useMemo<OccupancyData[]>(() => {
    if (!boats || !bookings) return [];
    
    return boats.map(boat => {
      // Выбираем бронирования для текущей лодки
      const boatBookings = bookings.filter((booking: Booking) => booking.boatId === boat.id && 
        booking.status !== 'cancelled');
      
      // Формируем данные для каждого дня в выбранном периоде
      const dates = daysInRange.map(date => {
        // Проверяем, есть ли бронирование на этот день
        const booking = boatBookings.find((b: Booking) => 
          isWithinInterval(date, {
            start: new Date(b.startDate),
            end: new Date(b.endDate)
          })
        );
        
        return {
          date,
          isBooked: !!booking,
          bookingId: booking?.id,
          clientName: booking?.clientName
        };
      });
      
      // Рассчитываем процент загруженности
      const bookedDaysCount = dates.filter(d => d.isBooked).length;
      const occupancyRate = (bookedDaysCount / dates.length) * 100;
      
      return {
        boatId: boat.id,
        boatName: boat.name,
        dates,
        occupancyRate
      };
    });
  }, [boats, bookings, daysInRange]);

  // Фильтрация данных по выбранной лодке
  const filteredOccupancyData = useMemo(() => {
    if (selectedBoatId === "all") {
      return occupancyData;
    }
    return occupancyData.filter(data => data.boatId === parseInt(selectedBoatId));
  }, [occupancyData, selectedBoatId]);

  // Сортировка лодок по загруженности (от наибольшей к наименьшей)
  const sortedOccupancyData = useMemo(() => {
    return [...filteredOccupancyData].sort((a, b) => b.occupancyRate - a.occupancyRate);
  }, [filteredOccupancyData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>График загруженности лодок</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedBoatId} onValueChange={setSelectedBoatId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все лодки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все лодки</SelectItem>
                {boats.map(boat => (
                  <SelectItem key={boat.id} value={boat.id.toString()}>
                    {boat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Загрузка данных...
          </div>
        ) : (
          <div className="space-y-6">
            {/* График с цветовыми ячейками */}
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="flex mb-2">
                  <div className="w-40 shrink-0"></div>
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {daysInRange.slice(0, 7).map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                        {format(day, 'eeeee', { locale: ru }).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                {sortedOccupancyData.map(boat => (
                  <div key={boat.boatId} className="flex mb-4 items-center">
                    <div className="w-40 shrink-0 flex items-center gap-2 pr-4">
                      <div className="w-4 h-4 rounded-sm" style={{ 
                        backgroundColor: `hsl(${Math.floor(boat.occupancyRate * 1.2)}, 80%, 50%)` 
                      }}></div>
                      <div className="truncate font-medium">{boat.boatName}</div>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: Math.ceil(boat.dates.length / 7) }).map((_, weekIndex) => (
                          <React.Fragment key={weekIndex}>
                            {boat.dates.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayData, dayIndex) => {
                              const dayOfMonth = format(dayData.date, 'd');
                              return (
                                <TooltipProvider key={dayIndex}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div 
                                        className={`
                                          aspect-square rounded relative cursor-pointer
                                          ${dayData.isBooked 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'bg-muted hover:bg-muted/80'
                                          }
                                        `}
                                      >
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px]">
                                          {dayOfMonth}
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {format(dayData.date, 'PPP', { locale: ru })}
                                      </p>
                                      {dayData.isBooked ? (
                                        <p className="font-medium">
                                          Забронировано: {dayData.clientName}
                                        </p>
                                      ) : (
                                        <p className="text-muted-foreground">Свободна</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Легенда и пояснение */}
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary"></div>
                  <span>Забронировано</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-muted"></div>
                  <span>Свободно</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => window.print()} // Простая реализация экспорта через печать
              >
                <Icon name="Printer" size={14} />
                Распечатать
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BoatOccupancyChart;
