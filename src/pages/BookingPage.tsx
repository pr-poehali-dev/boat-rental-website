
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBoats } from "@/hooks/useBoats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Icon from "@/components/ui/icon";

// Схема валидации для формы бронирования
const bookingSchema = z.object({
  startDate: z.date({
    required_error: "Выберите дату начала",
  }),
  endDate: z.date({
    required_error: "Выберите дату окончания",
  }),
  clientName: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  clientEmail: z.string().email("Введите корректный email"),
  clientPhone: z.string().min(6, "Введите корректный номер телефона"),
  comments: z.string().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: "Дата окончания должна быть позже даты начала",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Получаем данные о лодке
  const boatId = id ? parseInt(id) : undefined;
  const { useBoatDetails, checkBoatAvailability } = useBoats();
  const { data: boat, isLoading, error } = useBoatDetails(boatId);

  // Инициализация формы с данными пользователя, если он авторизован
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      clientName: user?.name || "",
      clientEmail: user?.email || "",
      clientPhone: "",
      comments: "",
    },
  });

  // Функция для расчета общей стоимости бронирования
  const calculateTotalPrice = (start: Date, end: Date, pricePerDay: number) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * pricePerDay;
  };

  // Обработчик изменения дат для проверки доступности и расчета стоимости
  const handleDatesChange = async () => {
    const startDate = form.getValues("startDate");
    const endDate = form.getValues("endDate");
    
    if (!boat || !startDate || !endDate || endDate <= startDate) return;
    
    setIsCheckingAvailability(true);
    
    try {
      const formatDate = (date: Date) => format(date, "yyyy-MM-dd");
      const available = await checkBoatAvailability(
        boat.id, 
        formatDate(startDate), 
        formatDate(endDate)
      );
      
      setIsAvailable(available);
      
      if (available) {
        const price = calculateTotalPrice(startDate, endDate, boat.price);
        setTotalPrice(price);
      }
    } catch (error) {
      console.error("Ошибка при проверке доступности:", error);
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Обработчик отправки формы бронирования
  const onSubmit = async (data: BookingFormValues) => {
    if (!boat) return;
    
    setIsSubmitting(true);
    
    try {
      const formatDate = (date: Date) => format(date, "yyyy-MM-dd");
      
      const bookingData = {
        boatId: boat.id,
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        comments: data.comments,
      };
      
      const response = await api.bookings.create(bookingData);
      
      if (response.success) {
        toast({
          title: "Бронирование успешно",
          description: "Мы свяжемся с вами для подтверждения деталей",
        });
        navigate("/booking/success", { 
          state: { 
            bookingId: response.data.id,
            boatName: boat.name,
            totalPrice,
          } 
        });
      } else {
        throw new Error(response.error || "Ошибка при создании бронирования");
      }
    } catch (error) {
      toast({
        title: "Ошибка при бронировании",
        description: error instanceof Error ? error.message : "Пожалуйста, попробуйте позже",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Автоматическая проверка доступности при изменении дат
  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");
  
  // Вызываем проверку доступности при изменении дат
  useState(() => {
    if (watchStartDate && watchEndDate && watchEndDate > watchStartDate) {
      handleDatesChange();
    }
  });

  // Отображение ошибки загрузки данных о лодке
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Ошибка при загрузке данных о лодке"}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          Вернуться назад
        </Button>
      </div>
    );
  }

  // Отображение загрузки данных о лодке
  if (isLoading || !boat) {
    return (
      <div className="container py-10">
        <div className="flex items-center">
          <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
          Загрузка данных о лодке...
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          Назад к лодке
        </Button>
        <h1 className="text-3xl font-bold">Бронирование лодки {boat.name}</h1>
        <p className="text-muted-foreground">Заполните форму для бронирования лодки</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Данные бронирования</CardTitle>
              <CardDescription>
                Укажите даты и контактную информацию
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Дата начала */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Дата начала</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <Icon name="Calendar" className="mr-2" size={16} />
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ru })
                                  ) : (
                                    <span>Выберите дату</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Дата окончания */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Дата окончания</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <Icon name="Calendar" className="mr-2" size={16} />
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ru })
                                  ) : (
                                    <span>Выберите дату</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  date < new Date() || 
                                  date <= form.getValues("startDate")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Статус доступности */}
                  {isCheckingAvailability ? (
                    <div className="flex items-center text-muted-foreground">
                      <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                      Проверка доступности...
                    </div>
                  ) : isAvailable === true ? (
                    <Alert className="bg-green-50 border-green-200">
                      <AlertDescription className="flex items-center text-green-700">
                        <Icon name="Check" className="mr-2" size={16} />
                        Лодка доступна в выбранные даты
                      </AlertDescription>
                    </Alert>
                  ) : isAvailable === false ? (
                    <Alert variant="destructive">
                      <AlertDescription className="flex items-center">
                        <Icon name="X" className="mr-2" size={16} />
                        Лодка недоступна в выбранные даты. Пожалуйста, выберите другие даты.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Имя клиента */}
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ваше имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Иван Иванов" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email клиента */}
                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="example@mail.ru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Телефон клиента */}
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер телефона</FormLabel>
                        <FormControl>
                          <Input placeholder="+7 (___) ___-__-__" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Комментарии */}
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Комментарии</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Укажите дополнительные пожелания или вопросы" 
                            {...field} 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || isAvailable !== true}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                        Обработка...
                      </div>
                    ) : (
                      "Забронировать"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Информация о лодке и бронировании */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Информация о лодке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-md overflow-hidden">
                <img 
                  src={boat.imageUrl} 
                  alt={boat.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{boat.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon name="Star" className="text-yellow-500" size={14} />
                  <span>{boat.rating}</span>
                  <span className="mx-1">•</span>
                  <span>{boat.reviews.length} отзывов</span>
                </div>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Категория:</span>
                  <span>{boat.categories.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Вместимость:</span>
                  <span>{boat.capacity} человек</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Длина:</span>
                  <span>{boat.length} м</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="mb-2">
                  <Label>Стоимость аренды:</Label>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{boat.price} ₽ / день</span>
                </div>
              </div>
              
              {totalPrice > 0 && isAvailable && (
                <div className="mt-4 p-4 bg-primary/10 rounded-md">
                  <h4 className="font-semibold mb-2">Детали бронирования:</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Дата начала:</span>
                      <span>{format(form.getValues("startDate"), "dd.MM.yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Дата окончания:</span>
                      <span>{format(form.getValues("endDate"), "dd.MM.yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Кол-во дней:</span>
                      <span>
                        {Math.ceil(
                          Math.abs(form.getValues("endDate").getTime() - form.getValues("startDate").getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between font-semibold text-base">
                        <span>Итого:</span>
                        <span>{totalPrice} ₽</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
