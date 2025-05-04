
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Состояние для редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });

  // Получение истории бронирований
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      const response = await api.bookings.getUserBookings();
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при загрузке бронирований');
      }
      return response.data;
    }
  });

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик сохранения изменений
  const handleSaveChanges = async () => {
    try {
      // Имитация сохранения данных на сервере
      setTimeout(() => {
        toast({
          title: "Изменения сохранены",
          description: "Данные профиля успешно обновлены.",
        });
        setIsEditing(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения. Попробуйте позже.",
        variant: "destructive",
      });
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для получения названия статуса на русском
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: "Ожидает подтверждения",
      confirmed: "Подтверждено",
      cancelled: "Отменено",
      completed: "Завершено"
    };
    return statusLabels[status] || status;
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

  // Если пользователь не авторизован
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Личный кабинет</h1>
        <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
          <Icon name="ArrowLeft" size={16} />
          Вернуться на главную
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Сайдбар с информацией о пользователе */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Профиль</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="CalendarClock" size={14} />
                  Клиент с {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userInfo.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userInfo.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    name="address"
                    value={userInfo.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveChanges} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Отмена</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-medium">{user.phone || "Не указан"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Адрес</p>
                  <p className="font-medium">{user.address || "Не указан"}</p>
                </div>
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Icon name="Pencil" size={16} className="mr-2" />
                  Редактировать профиль
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Основной контент */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="bookings">
            <TabsList className="mb-6">
              <TabsTrigger value="bookings">Мои бронирования</TabsTrigger>
              <TabsTrigger value="favorites">Избранное</TabsTrigger>
              <TabsTrigger value="reviews">Мои отзывы</TabsTrigger>
            </TabsList>

            {/* Вкладка с бронированиями */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>История бронирований</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                      Загрузка данных...
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking: any) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="col-span-2 flex gap-4 items-center">
                              <div className="w-16 h-16 bg-gray-200 rounded-md shrink-0 overflow-hidden">
                                <img src={booking.boatImage} alt={booking.boatName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{booking.boatName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                                </p>
                                <div className="mt-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                                    {getStatusLabel(booking.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col md:items-end md:justify-center">
                              <div className="text-lg font-bold">{booking.totalPrice.toLocaleString()} ₽</div>
                              <Button variant="outline" size="sm" className="mt-2">
                                Подробнее
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-muted/20 rounded-lg">
                      <Icon name="Calendar" size={40} className="mx-auto mb-2 text-muted-foreground" />
                      <h3 className="text-lg font-medium">У вас еще нет бронирований</h3>
                      <p className="text-muted-foreground mb-4">Выберите лодку в каталоге и забронируйте ее</p>
                      <Button onClick={() => navigate("/catalog")}>Перейти в каталог</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка с избранным */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Избранные лодки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 bg-muted/20 rounded-lg">
                    <Icon name="Heart" size={40} className="mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">У вас нет избранных лодок</h3>
                    <p className="text-muted-foreground mb-4">Добавляйте лодки в избранное, чтобы быстро к ним вернуться</p>
                    <Button onClick={() => navigate("/catalog")}>Перейти в каталог</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка с отзывами */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Мои отзывы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 bg-muted/20 rounded-lg">
                    <Icon name="MessageSquare" size={40} className="mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">У вас нет отзывов</h3>
                    <p className="text-muted-foreground mb-4">Оставляйте отзывы о забронированных лодках</p>
                    <Button onClick={() => navigate("/catalog")}>Перейти в каталог</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
