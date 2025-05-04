
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Booking } from "@/types/api.types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// Типы данных для статистики
interface StatusCount {
  status: string;
  count: number;
  color: string;
}

interface MonthlyBookings {
  month: string;
  count: number;
}

interface IncomeStats {
  totalIncome: number;
  averageBookingValue: number;
  incomeByMonth: Array<{
    month: string;
    income: number;
  }>;
}

// Цвета для статусов бронирований
const STATUS_COLORS = {
  pending: "#FFB547",
  confirmed: "#4CAF50",
  cancelled: "#F44336",
  completed: "#2196F3"
};

// Перевод статусов на русский
const STATUS_LABELS = {
  pending: "Ожидает",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
  completed: "Завершено"
};

const BookingStatistics = () => {
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

  // Статистика по статусам бронирований
  const statusStats = useMemo<StatusCount[]>(() => {
    if (!bookings.length) return [];
    
    const statusCounts = bookings.reduce((acc: Record<string, number>, booking: Booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#999"
    }));
  }, [bookings]);

  // Статистика по месяцам
  const monthlyStats = useMemo<MonthlyBookings[]>(() => {
    if (!bookings.length) return [];
    
    const months: Record<string, number> = {};
    const monthNames = [
      "Янв", "Фев", "Мар", "Апр", "Май", "Июн", 
      "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
    ];
    
    bookings.forEach((booking: Booking) => {
      const date = new Date(booking.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      months[monthKey] = (months[monthKey] || 0) + 1;
    });
    
    // Сортируем месяцы по дате
    return Object.entries(months)
      .map(([key, count]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          month: `${monthNames[month]} ${year}`,
          key,
          count,
          sortKey: year * 100 + month
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-6) // Последние 6 месяцев
      .map(({ month, count }) => ({ month, count }));
  }, [bookings]);

  // Статистика по доходам
  const incomeStats = useMemo<IncomeStats>(() => {
    if (!bookings.length) return { 
      totalIncome: 0, 
      averageBookingValue: 0,
      incomeByMonth: []
    };
    
    // Учитываем только подтвержденные и завершенные бронирования
    const validBookings = bookings.filter((b: Booking) => 
      b.status === 'confirmed' || b.status === 'completed'
    );
    
    // Общий доход
    const totalIncome = validBookings.reduce(
      (sum, booking: Booking) => sum + (booking.totalPrice || 0), 
      0
    );
    
    // Средняя стоимость бронирования
    const averageBookingValue = validBookings.length 
      ? totalIncome / validBookings.length 
      : 0;
    
    // Доход по месяцам
    const monthlyIncome: Record<string, number> = {};
    const monthNames = [
      "Янв", "Фев", "Мар", "Апр", "Май", "Июн", 
      "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
    ];
    
    validBookings.forEach((booking: Booking) => {
      const date = new Date(booking.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + (booking.totalPrice || 0);
    });
    
    const incomeByMonth = Object.entries(monthlyIncome)
      .map(([key, income]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          month: `${monthNames[month]} ${year}`,
          income,
          sortKey: year * 100 + month
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-6); // Последние 6 месяцев
    
    return {
      totalIncome,
      averageBookingValue,
      incomeByMonth
    };
  }, [bookings]);

  // Форматирование чисел для отображения
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  // Кастомный тултип для графиков
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}: {formatNumber(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика бронирований</CardTitle>
        <CardDescription>Анализ бронирований и доходов</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Загрузка данных...
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="statuses">По статусам</TabsTrigger>
              <TabsTrigger value="monthly">По месяцам</TabsTrigger>
              <TabsTrigger value="income">Доходы</TabsTrigger>
            </TabsList>
            
            {/* Обзор */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Всего бронирований</p>
                        <p className="text-3xl font-bold">{bookings.length}</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Icon name="Calendar" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Активных бронирований</p>
                        <p className="text-3xl font-bold">
                          {bookings.filter((b: Booking) => b.status === 'confirmed').length}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <Icon name="CheckCircle" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Общий доход</p>
                        <p className="text-3xl font-bold">{formatNumber(incomeStats.totalIncome)} ₽</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <Icon name="Wallet" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* График статусов */}
                <Card className="p-4">
                  <CardTitle className="text-base mb-4">Статусы бронирований</CardTitle>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="status"
                          label={({ status }) => STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                        >
                          {statusStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                {/* График по месяцам */}
                <Card className="p-4">
                  <CardTitle className="text-base mb-4">Бронирования по месяцам</CardTitle>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Количество" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            {/* Вкладка с детальной информацией по статусам */}
            <TabsContent value="statuses">
              <div className="grid grid-cols-1 gap-4 mb-6">
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  const count = statusStats.find(s => s.status === status)?.count || 0;
                  const percentage = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                  
                  return (
                    <Card key={status}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
                          ></div>
                          <h3 className="font-medium">{label}</h3>
                          <div className="ml-auto flex items-center gap-4">
                            <span className="text-lg font-bold">{count}</span>
                            <span className="text-sm text-muted-foreground">({percentage}%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) => 
                        `${STATUS_LABELS[status as keyof typeof STATUS_LABELS]}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Вкладка с детальной информацией по месяцам */}
            <TabsContent value="monthly">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Бронирования за последние 6 месяцев</h3>
                <p className="text-muted-foreground mb-4">
                  Динамика количества бронирований по месяцам
                </p>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Количество бронирований" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthlyStats.map((month) => (
                  <Card key={month.month}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{month.month}</h3>
                        <span className="text-lg font-bold">{month.count}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Вкладка с детальной информацией по доходам */}
            <TabsContent value="income">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Общий доход</p>
                        <p className="text-3xl font-bold">{formatNumber(incomeStats.totalIncome)} ₽</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <Icon name="TrendingUp" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Средний чек</p>
                        <p className="text-3xl font-bold">{formatNumber(Math.round(incomeStats.averageBookingValue))} ₽</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Icon name="PiggyBank" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Доход по месяцам</h3>
                <p className="text-muted-foreground mb-4">
                  Динамика дохода за последние 6 месяцев
                </p>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeStats.incomeByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="income" name="Доход (₽)" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingStatistics;
