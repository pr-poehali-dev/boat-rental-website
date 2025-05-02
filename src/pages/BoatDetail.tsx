
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import CatalogHeader from "@/components/CatalogHeader";
import { boats, BoatType } from "@/data/boats";
import { useCart } from "@/hooks/use-cart";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const BoatDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [boat, setBoat] = useState<BoatType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalDays, setRentalDays] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Имитация загрузки данных
    setLoading(true);
    setTimeout(() => {
      const foundBoat = boats.find(boat => boat.id === Number(id));
      setBoat(foundBoat || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = () => {
    if (!boat) return;
    
    addToCart({
      id: boat.id,
      name: boat.name,
      price: boat.price,
      image: boat.images[0],
      days: rentalDays
    });
    
    toast({
      title: "Добавлено в корзину",
      description: `${boat.name} (${rentalDays} дн.) добавлен в корзину`,
    });
  };

  const handleProceedToCheckout = () => {
    if (!boat) return;
    
    addToCart({
      id: boat.id,
      name: boat.name,
      price: boat.price,
      image: boat.images[0],
      days: rentalDays
    });
    
    navigate("/cart");
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      fishing: "Рыболовная",
      family: "Семейная", 
      sport: "Спортивная",
      luxury: "Премиум"
    };
    return labels[category] || category;
  };

  // Похожие лодки (до 3-х штук)
  const getSimilarBoats = () => {
    if (!boat) return [];
    
    return boats
      .filter(b => 
        b.id !== boat.id && 
        b.categories.some(c => boat.categories.includes(c))
      )
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <CatalogHeader />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="min-h-screen">
        <CatalogHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <Icon name="AlertCircle" className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-4">Лодка не найдена</h1>
          <p className="text-gray-600 mb-8">К сожалению, запрашиваемая лодка не существует или была удалена.</p>
          <Button asChild>
            <Link to="/catalog">Вернуться в каталог</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader />
      
      {/* Хлебные крошки */}
      <div className="bg-white py-3 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <Icon name="ChevronRight" size={16} className="mx-2" />
            <Link to="/catalog" className="hover:text-blue-600">Каталог</Link>
            <Icon name="ChevronRight" size={16} className="mx-2" />
            <span className="text-gray-900">{boat.name}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Галерея */}
            <div className="md:w-1/2 p-6">
              <div className="relative mb-4 rounded-lg overflow-hidden">
                <img 
                  src={boat.images[selectedImage]} 
                  alt={boat.name} 
                  className="w-full h-80 object-cover"
                />
                {boat.isNew && (
                  <Badge className="absolute top-4 left-4 bg-blue-600">Новинка</Badge>
                )}
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {boat.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`
                      w-20 h-20 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2
                      ${index === selectedImage ? 'border-blue-600' : 'border-transparent'}
                    `}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${boat.name} - изображение ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Информация о лодке */}
            <div className="md:w-1/2 p-6 md:border-l border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{boat.name}</h1>
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded">
                  <Icon name="Star" className="text-yellow-500 mr-1" size={18} />
                  <span className="font-semibold">{boat.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{boat.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {boat.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {getCategoryLabel(category)}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Users" className="mx-auto mb-1 text-blue-600" size={20} />
                  <div className="text-sm text-gray-600">Вместимость</div>
                  <div className="font-semibold">{boat.capacity} человек</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Ruler" className="mx-auto mb-1 text-blue-600" size={20} />
                  <div className="text-sm text-gray-600">Длина</div>
                  <div className="font-semibold">{boat.length} м</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Zap" className="mx-auto mb-1 text-blue-600" size={20} />
                  <div className="text-sm text-gray-600">Мощность</div>
                  <div className="font-semibold">{boat.specifications.power}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="CalendarDays" className="mx-auto mb-1 text-blue-600" size={20} />
                  <div className="text-sm text-gray-600">Год выпуска</div>
                  <div className="font-semibold">{boat.year}</div>
                </div>
              </div>
              
              <div className="mb-6 p-4 border border-blue-100 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-800 mb-2">Стоимость аренды:</div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-blue-700">{boat.price} ₽</span>
                  <span className="text-gray-600 ml-2">/ день</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Количество дней
                    </label>
                    <Select 
                      value={rentalDays.toString()} 
                      onValueChange={(value) => setRentalDays(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите количество дней" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 14, 30].map(days => (
                          <SelectItem key={days} value={days.toString()}>
                            {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата начала аренды
                    </label>
                    <Input 
                      type="date" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="text-lg font-bold mb-4">
                  Итого: {boat.price * rentalDays} ₽ за {rentalDays} {rentalDays === 1 ? 'день' : rentalDays < 5 ? 'дня' : 'дней'}
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleAddToCart}
                  >
                    <Icon name="ShoppingCart" className="mr-2" size={18} />
                    Добавить в корзину
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleProceedToCheckout}
                  >
                    Арендовать сейчас
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Вкладки с дополнительной информацией */}
          <div className="p-6 border-t">
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description">Описание</TabsTrigger>
                <TabsTrigger value="specifications">Характеристики</TabsTrigger>
                <TabsTrigger value="features">Оснащение</TabsTrigger>
                <TabsTrigger value="rental">Условия аренды</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description">
                <div className="space-y-4">
                  <p className="text-gray-700">{boat.description}</p>
                  <p className="text-gray-700">
                    Лодка {boat.name} {boat.year} года выпуска предлагает отличные возможности для 
                    {boat.categories.includes('fishing') ? ' рыбалки и ' : ' '}
                    активного отдыха на воде. С вместимостью до {boat.capacity} человек, 
                    эта модель идеально подходит для 
                    {boat.categories.includes('family') ? ' семейного отдыха' : ' водных развлечений'}.
                  </p>
                  <p className="text-gray-700">
                    Благодаря мощному двигателю {boat.specifications.engine} мощностью {boat.specifications.power}, 
                    лодка способна развивать скорость до {boat.specifications.maxSpeed}, 
                    что обеспечивает комфортное передвижение по воде и безопасность пассажиров.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Основные характеристики</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Длина</span>
                        <span className="font-medium">{boat.length} м</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Год выпуска</span>
                        <span className="font-medium">{boat.year}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Вместимость</span>
                        <span className="font-medium">{boat.capacity} чел.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Двигатель и производительность</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Двигатель</span>
                        <span className="font-medium">{boat.specifications.engine}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Мощность</span>
                        <span className="font-medium">{boat.specifications.power}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Максимальная скорость</span>
                        <span className="font-medium">{boat.specifications.maxSpeed}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Объем топливного бака</span>
                        <span className="font-medium">{boat.specifications.fuel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Оснащение</h3>
                    <ul className="space-y-3">
                      {boat.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Icon name="CheckCircle2" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Безопасность</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Icon name="ShieldCheck" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Спасательные жилеты для взрослых и детей</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="ShieldCheck" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Аварийный комплект и аптечка</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="ShieldCheck" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Якорь и швартовочное оборудование</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="ShieldCheck" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Сигнальные огни и средства связи</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rental">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Условия аренды</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Icon name="Info" className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Залог: 15 000 ₽ (возвращается после аренды)</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="Info" className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Минимальный срок аренды: 1 день</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="Info" className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Топливо оплачивается отдельно</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="Info" className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Требуется удостоверение на право управления маломерным судном</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Что включено</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Icon name="Check" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Базовый инструктаж по управлению</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="Check" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Спасательные жилеты по количеству пассажиров</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="Check" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Страховка ОСАГО</span>
                      </li>
                      <li className="flex items-start">
                        <Icon name="Check" className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
                        <span>Техническая поддержка 24/7</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Похожие лодки */}
        {getSimilarBoats().length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Похожие лодки</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getSimilarBoats().map(similarBoat => (
                <Card key={similarBoat.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 relative">
                    <img 
                      src={similarBoat.images[0]} 
                      alt={similarBoat.name}
                      className="w-full h-full object-cover" 
                    />
                    {similarBoat.isNew && (
                      <Badge className="absolute top-2 left-2 bg-blue-600">Новинка</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        <Link 
                          to={`/boat/${similarBoat.id}`} 
                          className="hover:text-blue-600"
                        >
                          {similarBoat.name}
                        </Link>
                      </h3>
                      <div className="flex items-center">
                        <Icon name="Star" className="text-yellow-500 mr-1" size={14} />
                        <span className="text-sm">{similarBoat.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{similarBoat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700">{similarBoat.price} ₽/день</span>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/boat/${similarBoat.id}`}>Подробнее</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoatDetail;
