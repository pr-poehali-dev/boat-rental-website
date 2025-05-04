
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

// Интерфейс для данных бронирования
interface BookingData {
  id: number;
  boatId: number;
  boatName: string;
  boatImage?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Получаем данные о бронировании из state или демо-данные
  const [booking, setBooking] = useState<BookingData | null>(null);
  
  useEffect(() => {
    // Пытаемся получить данные из location.state
    const bookingData = location.state?.booking;
    
    if (bookingData) {
      setBooking(bookingData);
    } else {
      // Если данных нет, используем демо-данные
      setBooking({
        id: 12345,
        boatId: 1,
        boatName: "Морская жемчужина",
        boatImage: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=800&q=80",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalPrice: 45000,
        clientName: "Иван Петров",
        clientEmail: "ivan@example.com",
        clientPhone: "+7 (901) 123-45-67",
        status: "confirmed",
        paymentMethod: "Банковская карта",
        createdAt: new Date().toISOString()
      });
    }
  }, [location]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для скачивания подтверждения бронирования
  const handleDownloadConfirmation = () => {
    if (!booking) return;
    
    // Создаем содержимое HTML для печати
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Подтверждение бронирования №${booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .booking-id { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .info-row { display: flex; margin-bottom: 10px; }
          .info-label { width: 150px; font-weight: bold; }
          .boat-details { margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
          .price-details { margin: 20px 0; }
          .total-price { font-size: 20px; font-weight: bold; text-align: right; }
          .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="booking-id">Подтверждение бронирования №${booking.id}</div>
          <p>Дата создания: ${new Date(booking.createdAt).toLocaleString('ru-RU')}</p>
        </div>
        
        <div class="info-row">
          <div class="info-label">Клиент:</div>
          <div>${booking.clientName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div>${booking.clientEmail}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Телефон:</div>
          <div>${booking.clientPhone}</div>
        </div>
        
        <div class="boat-details">
          <h3>${booking.boatName}</h3>
          <div class="info-row">
            <div class="info-label">Период аренды:</div>
            <div>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</div>
          </div>
        </div>
        
        <div class="price-details">
          <div class="info-row">
            <div class="info-label">Способ оплаты:</div>
            <div>${booking.paymentMethod || 'Не указан'}</div>
          </div>
          <div class="total-price">
            Итого: ${booking.totalPrice.toLocaleString()} ₽
          </div>
        </div>
        
        <div class="footer">
          <p>Благодарим за выбор нашего сервиса аренды лодок!</p>
          <p>При возникновении вопросов свяжитесь с нами по телефону: +7 (800) 123-45-67</p>
        </div>
      </body>
      </html>
    `;
    
    // Создаем Blob для скачивания
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = `Бронирование_${booking.id}.html`;
    document.body.appendChild(link);
    
    // Имитируем клик по ссылке
    link.click();
    
    // Удаляем элемент
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Подтверждение скачано",
      description: "Файл с информацией о бронировании сохранен на ваше устройство."
    });
  };

  // Функция для добавления события в календарь
  const handleAddToCalendar = () => {
    if (!booking) return;
    
    // Создаем данные для iCalendar
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    // Форматируем даты для iCalendar (формат: YYYYMMDDTHHMMSSZ)
    const formatICalDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//hacksw/handcal//NONSGML v1.0//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@boats.com`,
      `DTSTAMP:${formatICalDate(new Date())}`,
      `DTSTART:${formatICalDate(startDate)}`,
      `DTEND:${formatICalDate(endDate)}`,
      `SUMMARY:Аренда лодки "${booking.boatName}"`,
      `DESCRIPTION:Бронирование №${booking.id}. Лодка: ${booking.boatName}. Стоимость: ${booking.totalPrice} ₽`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    // Создаем Blob для скачивания
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = `Аренда_лодки_${booking.id}.ics`;
    document.body.appendChild(link);
    
    // Имитируем клик по ссылке
    link.click();
    
    // Удаляем элемент
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Событие создано",
      description: "Файл календаря с информацией о бронировании сохранен на ваше устройство."
    });
  };

  // Функция для отправки подтверждения на почту
  const handleSendEmail = () => {
    toast({
      title: "Подтверждение отправлено",
      description: `Информация о бронировании отправлена на ${booking?.clientEmail}.`
    });
  };

  // Если данные о бронировании еще не загрузились
  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center">
              <Icon name="Loader2" className="mb-4 animate-spin" size={36} />
              <p className="text-center">Загрузка информации о бронировании...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100">
            <Icon name="CheckCircle" className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Бронирование успешно оформлено!</h2>
            <p className="text-sm text-muted-foreground">
              Информация о бронировании отправлена на вашу электронную почту.
            </p>
          </div>
        </div>
        
        <Card className="border-2 border-green-100">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle>Подтверждение бронирования</CardTitle>
                <CardDescription>Бронирование #{booking.id}</CardDescription>
              </div>
              <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Подтверждено
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Информация о лодке */}
            <div className="flex gap-4">
              {booking.boatImage && (
                <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                  <img 
                    src={booking.boatImage} 
                    alt={booking.boatName} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{booking.boatName}</h3>
                <p className="text-sm text-muted-foreground">
                  Период аренды: {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </p>
                <div className="mt-1 font-medium">{booking.totalPrice.toLocaleString()} ₽</div>
              </div>
            </div>
            
            <Separator />
            
            {/* Данные клиента */}
            <div>
              <h3 className="font-medium mb-2">Информация о клиенте</h3>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-sm text-muted-foreground">Имя:</span>
                  <span>{booking.clientName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-sm text-muted-foreground">Email:</span>
                  <span>{booking.clientEmail}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-sm text-muted-foreground">Телефон:</span>
                  <span>{booking.clientPhone}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Детали оплаты */}
            <div>
              <h3 className="font-medium mb-2">Детали оплаты</h3>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-sm text-muted-foreground">Способ оплаты:</span>
                  <span>{booking.paymentMethod || "Не указан"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-sm text-muted-foreground">Статус:</span>
                  <span className="text-green-600 font-medium">Оплачено</span>
                </div>
              </div>
            </div>
            
            {/* Инструкции */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Icon name="Info" size={16} className="text-blue-600" />
                Важная информация
              </h3>
              <ul className="text-sm space-y-1">
                <li>Пожалуйста, прибудьте за 15 минут до начала аренды</li>
                <li>При себе необходимо иметь паспорт и права на управление судном</li>
                <li>Адрес: г. Москва, ул. Речная, д. 10, причал №3</li>
                <li>Контактный телефон: +7 (800) 123-45-67</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex-col-reverse sm:flex-row gap-3 sm:justify-between">
            <Button variant="outline" onClick={() => navigate("/")}>
              Вернуться на главную
            </Button>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSendEmail}
                title="Отправить на почту"
              >
                <Icon name="Mail" size={18} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleAddToCalendar}
                title="Добавить в календарь"
              >
                <Icon name="CalendarPlus" size={18} />
              </Button>
              
              <Button onClick={handleDownloadConfirmation} className="w-full sm:w-auto gap-2">
                <Icon name="Download" size={16} />
                Скачать подтверждение
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex justify-center">
          <div className="flex flex-col items-center text-center">
            <p className="text-muted-foreground mb-3">
              Есть вопросы по бронированию?
            </p>
            <Button variant="outline" onClick={() => navigate("/contacts")}>
              Связаться с нами
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
