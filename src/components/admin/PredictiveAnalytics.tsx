
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Icon from "@/components/ui/icon";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// Типы данных для прогнозной аналитики
type ForecastPeriod = "month" | "quarter" | "year";
type ForecastType = "occupancy" | "revenue" | "demand";

interface ForecastData {
  period: string;
  actual: number;
  forecast: number;
}

// Константы для расчетов
const SEASONALITY_FACTORS = {
  1: 0.7,  // Январь
  2: 0.7,  // Февраль
  3: 0.8,  // Март
  4: 0.9,  // Апрель
  5: 1.0,  // Май
  6: 1.2,  // Июнь
  7: 1.5,  // Июль
  8: 1.5,  // Август
  9: 1.1,  // Сентябрь
  10: 0.9, // Октябрь
  11: 0.8, // Ноябрь
  12: 0.7  // Декабрь
};

// Названия месяцев на русском
const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const PredictiveAnalytics = () => {
  // Состояния для управления прогнозами
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>("month");
  const [forecastType, setForecastType] = useState<ForecastType>("occupancy");
  
  // Получение данных о бронированиях для анализа
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

  // Получение данных о лодках для анализа
  const { data: boats = [] } = useQuery({
    queryKey: ['admin-boats'],
    queryFn: async () => {
      const response = await api.boats.getAll();
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при загрузке лодок');
      }
      return response.data;
    }
  });

  // Генерация исторических данных на основе имеющихся бронирований
  const historicalData = useMemo(() => {
    // Получаем текущую дату для расчетов
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Создаем исторические данные за последние 12 месяцев
    const monthlyData: Record<string, {bookings: number, revenue: number}> = {};
    
    // Заполняем базовые данные для всех 12 месяцев
    for (let i = 0; i < 12; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((i - currentMonth) / 12);
      const key = `${year}-${month + 1}`;
      
      monthlyData[key] = {
        bookings: 0,
        revenue: 0
      };
    }
    
    // Заполняем данные на основе имеющихся бронирований
    bookings.forEach((booking: any) => {
      const date = new Date(booking.createdAt);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      
      if (monthlyData[key]) {
        monthlyData[key].bookings += 1;
        monthlyData[key].revenue += booking.totalPrice;
      }
    });
    
    // Преобразуем данные в массив для графиков
    return Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        period: `${MONTH_NAMES[month-1]} ${year}`,
        month,
        year,
        bookings: data.bookings,
        revenue: data.revenue,
        // Рассчитываем загруженность (прибл. процент занятых дней)
        occupancy: (data.bookings / (boats.length || 1)) * 100 * 0.2 // Примерный расчет
      };
    }).sort((a, b) => {
      // Сортировка по дате (год, месяц)
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [bookings, boats]);

  // Генерация прогнозных данных на основе исторических
  const forecastData = useMemo(() => {
    if (!historicalData.length) return [];
    
    // Количество периодов для прогноза в зависимости от выбранного периода
    const periodsCount = forecastPeriod === "month" ? 6 : forecastPeriod === "quarter" ? 4 : 2;
    
    // Получаем последний месяц и год из исторических данных
    const lastData = historicalData[historicalData.length - 1];
    let currentMonth = lastData.month;
    let currentYear = lastData.year;
    
    // Создаем базу для прогноза на основе исторических данных
    const forecasts: ForecastData[] = [];
    
    // Для каждого периода генерируем прогноз
    for (let i = 0; i < periodsCount; i++) {
      // Увеличиваем месяц для прогноза
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }
      
      // Получаем аналогичный период из прошлого
      const previousYearData = historicalData.find(
        data => data.month === currentMonth && data.year === currentYear - 1
      );
      
      // Получаем данные за предыдущий месяц
      const previousMonthIndex = (currentMonth - 2 + 12) % 12 + 1;
      const previousMonthData = historicalData.find(
        data => data.month === previousMonthIndex && 
               (previousMonthIndex === 12 ? data.year === currentYear - 1 : data.year === currentYear)
      );
      
      // Коэффициент сезонности
      const seasonality = SEASONALITY_FACTORS[currentMonth as keyof typeof SEASONALITY_FACTORS] || 1;
      
      // Базовый прогноз на основе предыдущих данных
      let baseForecast = 0;
      
      // Выбираем метрику для прогноза
      let metricKey: 'bookings' | 'revenue' | 'occupancy' = 'bookings';
      switch (forecastType) {
        case "occupancy":
          metricKey = 'occupancy';
          break;
        case "revenue":
          metricKey = 'revenue';
          break;
        case "demand":
          metricKey = 'bookings';
          break;
      }
      
      // Расчет базового прогноза
      if (previousYearData) {
        // Если есть данные за аналогичный период прошлого года, используем их
        baseForecast = previousYearData[metricKey];
      } else if (previousMonthData) {
        // Если нет данных за прошлый год, используем последний известный месяц
        baseForecast = previousMonthData[metricKey];
      } else if (historicalData.length > 0) {
        // Если нет данных за предыдущий месяц, используем среднее значение
        baseForecast = historicalData.reduce((sum, data) => sum + data[metricKey], 0) / historicalData.length;
      }
      
      // Добавляем случайное отклонение и применяем сезонность
      const randomFactor = 0.9 + Math.random() * 0.2; // От 0.9 до 1.1
      const forecast = baseForecast * seasonality * randomFactor;
      
      // Добавляем прогноз в массив
      forecasts.push({
        period: `${MONTH_NAMES[currentMonth-1]} ${currentYear}`,
        actual: 0, // Нет фактических данных для будущего
        forecast: Math.round(forecast)
      });
    }
    
    // Добавляем исторические данные для построения графика
    const result = [
      ...historicalData.slice(-6).map(data => ({
        period: data.period,
        actual: data[metricKey],
        forecast: 0 // Нет прогноза для прошлого
      })),
      ...forecasts
    ];
    
    return result;
  }, [historicalData, forecastPeriod, forecastType]);
  
  // Рекомендации по ценам на основе прогнозов
  const priceRecommendations = useMemo(() => {
    if (!historicalData.length || !boats.length) return [];
    
    // Получаем текущий месяц
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Получаем коэффициент сезонности для следующих 3 месяцев
    const nextMonths = [];
    for (let i = 0; i < 3; i++) {
      const month = (currentMonth + i) % 12 || 12;
      nextMonths.push({
        month: MONTH_NAMES[month - 1],
        seasonality: SEASONALITY_FACTORS[month as keyof typeof SEASONALITY_FACTORS] || 1
      });
    }
    
    // Создаем рекомендации для каждой лодки
    return boats.map(boat => {
      // Рассчитываем рекомендованную цену на основе текущей цены и сезонности
      const basePrice = boat.price;
      
      // Получаем прогноз спроса на следующие месяцы
      const demandForecast = forecastData
        .filter(data => data.forecast > 0)
        .slice(0, 3)
        .map((data, index) => {
          const seasonality = nextMonths[index]?.seasonality || 1;
          
          // Коэффициент корректировки цены на основе спроса и сезонности
          let priceAdjustment = 0;
          
          if (forecastType === 'demand' || forecastType === 'occupancy') {
            // Если прогноз высокий - повышаем цену, если низкий - снижаем
            const demandRatio = data.forecast / (forecastData[0]?.actual || 1);
            priceAdjustment = (demandRatio - 1) * 0.1;
          }
          
          // Рассчитываем рекомендованную цену
          const recommendedPrice = Math.round(basePrice * (1 + (seasonality - 1) * 0.5 + priceAdjustment));
          
          return {
            month: nextMonths[index]?.month || '',
            recommended: recommendedPrice,
            min: Math.round(recommendedPrice * 0.9),
            max: Math.round(recommendedPrice * 1.1),
            change: Math.round((recommendedPrice / basePrice - 1) * 100)
          };
        });
      
      return {
        id: boat.id,
        name: boat.name,
        currentPrice: basePrice,
        recommendations: demandForecast
      };
    });
  }, [boats, historicalData, forecastData, forecastType]);

  // Форматирование данных для графиков
  const getChartTitle = () => {
    switch (forecastType) {
      case "occupancy":
        return "Прогноз загруженности (%)";
      case "revenue":
        return "Прогноз дохода (₽)";
      case "demand":
        return "Прогноз спроса (кол-во бронирований)";
    }
  };

  // Форматирование чисел для отображения
  const formatNumber = (num: number) => {
    if (forecastType === "revenue") {
      return new Intl.NumberFormat('ru-RU').format(num) + " ₽";
    } else if (forecastType === "occupancy") {
      return num.toFixed(1) + "%";
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогнозная аналитика</CardTitle>
        <CardDescription>
          Прогнозы загруженности, доходов и спроса на основе исторических данных
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Загрузка данных...
          </div>
        ) : (
          <Tabs defaultValue="forecast">
            <TabsList className="mb-6">
              <TabsTrigger value="forecast">Прогнозы</TabsTrigger>
              <TabsTrigger value="pricing">Оптимизация цен</TabsTrigger>
              <TabsTrigger value="seasonal">Сезонный анализ</TabsTrigger>
            </TabsList>
            
            {/* Вкладка с прогнозами */}
            <TabsContent value="forecast" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2">
                  <Select value={forecastType} onValueChange={(value) => setForecastType(value as ForecastType)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Тип прогноза" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="occupancy">Загруженность</SelectItem>
                      <SelectItem value="revenue">Доход</SelectItem>
                      <SelectItem value="demand">Спрос</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={forecastPeriod} onValueChange={(value) => setForecastPeriod(value as ForecastPeriod)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Период" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Месяцы</SelectItem>
                      <SelectItem value="quarter">Кварталы</SelectItem>
                      <SelectItem value="year">Годы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="gap-2">
                  <Icon name="Download" size={16} />
                  Экспорт данных
                </Button>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{getChartTitle()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [formatNumber(value), ""]}
                          labelFormatter={(label) => `Период: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          name="Фактические данные"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="forecast"
                          name="Прогноз"
                          stroke="#16a34a"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Icon name="TrendingUp" className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Тренд</p>
                        <p className="text-lg font-bold">
                          {forecastData.length > 0 && forecastData[forecastData.length - 1].forecast > forecastData[0].actual
                            ? "Положительный ↑"
                            : "Отрицательный ↓"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-green-100">
                        <Icon name="Percent" className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ожидаемый рост</p>
                        <p className="text-lg font-bold">
                          {forecastData.length > 0 
                            ? Math.round(
                                (forecastData[forecastData.length - 1].forecast / forecastData[0].actual - 1) * 100
                              ) + "%"
                            : "0%"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Icon name="Calendar" className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Лучший месяц</p>
                        <p className="text-lg font-bold">
                          {forecastData
                            .sort((a, b) => b.forecast - a.forecast)
                            .slice(0, 1)
                            .map(data => data.period)[0] || "Нет данных"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Вкладка с оптимизацией цен */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Рекомендации по ценообразованию</CardTitle>
                  <CardDescription>
                    Оптимальные цены на основе прогнозируемого спроса и сезонности
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceRecommendations.map(boat => (
                      <Card key={boat.id} className="p-4">
                        <div className="flex flex-col space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">{boat.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              Текущая цена: <span className="font-medium">{boat.currentPrice.toLocaleString()} ₽</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {boat.recommendations.map((rec, index) => (
                              <div key={index} className="border rounded-md p-3">
                                <div className="text-sm font-medium mb-1">{rec.month}</div>
                                <div className="flex items-center justify-between">
                                  <div className="text-lg font-bold">{rec.recommended.toLocaleString()} ₽</div>
                                  <div className={`text-sm ${rec.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {rec.change > 0 ? '+' : ''}{rec.change}%
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Диапазон: {rec.min.toLocaleString()} ₽ - {rec.max.toLocaleString()} ₽
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <Icon name="LightbulbIcon" className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Советы по оптимизации цен</h3>
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>Повышайте цены в периоды пикового спроса (лето, праздники)</li>
                      <li>Предлагайте скидки в периоды низкого спроса</li>
                      <li>Используйте специальные предложения для выходных дней</li>
                      <li>Внедрите раннее бронирование со скидкой для увеличения загрузки</li>
                      <li>Регулярно мониторьте изменения спроса для корректировки цен</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Вкладка с сезонным анализом */}
            <TabsContent value="seasonal" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Сезонная динамика спроса</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(SEASONALITY_FACTORS).map(([month, factor]) => ({
                          month: MONTH_NAMES[parseInt(month) - 1],
                          factor: factor * 100
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(0)}%`, "Относительный спрос"]}
                        />
                        <Legend />
                        <Bar dataKey="factor" name="Относительный спрос" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Пиковые периоды</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-1">Высокий сезон (лето)</h4>
                        <p className="text-sm text-muted-foreground">
                          Июнь, Июль, Август — максимальный спрос и высшие цены. 
                          Рекомендуется повышать цены на 20-50% от базовой и требовать 
                          предоплату для гарантированного бронирования.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-1">Средний сезон (весна/осень)</h4>
                        <p className="text-sm text-muted-foreground">
                          Апрель, Май, Сентябрь — умеренный спрос. 
                          Рекомендуется держать цены на уровне базовых или с наценкой до 10%.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <h4 className="font-medium mb-1">Низкий сезон (зима)</h4>
                        <p className="text-sm text-muted-foreground">
                          Декабрь, Январь, Февраль — низкий спрос. 
                          Рекомендуется снижать цены на 10-30% и предлагать дополнительные услуги.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Рекомендации по сезонам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-100 mt-1">
                          <Icon name="TrendingUp" className="text-green-600" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">Высокий сезон</h4>
                          <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1">
                            <li>Фокус на максимизацию прибыли</li>
                            <li>Требование полной предоплаты</li>
                            <li>Минимальный срок аренды (от 2-3 дней)</li>
                            <li>Предоставление премиум-услуг</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-100 mt-1">
                          <Icon name="BarChart3" className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">Средний сезон</h4>
                          <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1">
                            <li>Баланс между объемом и маржинальностью</li>
                            <li>Гибкая политика отмены бронирований</li>
                            <li>Акции для повторных клиентов</li>
                            <li>Скидки за раннее бронирование</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-amber-100 mt-1">
                          <Icon name="TrendingDown" className="text-amber-600" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">Низкий сезон</h4>
                          <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1">
                            <li>Фокус на максимизацию загрузки</li>
                            <li>Значительные скидки (до 30%)</li>
                            <li>Специальные предложения для групп</li>
                            <li>Гибкие условия аренды без минимального срока</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalytics;
