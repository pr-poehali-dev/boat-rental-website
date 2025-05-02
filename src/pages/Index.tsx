
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredBoats = [
    {
      id: 1,
      name: "Yamaha 190 FSH Sport",
      image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=500",
      price: 5000,
      description: "Идеально для рыбалки и активного отдыха",
    },
    {
      id: 2,
      name: "Bayliner VR6",
      image: "https://images.unsplash.com/photo-1542902093-d55926049754?auto=format&fit=crop&q=80&w=500",
      price: 7500,
      description: "Комфортная лодка для семейного отдыха",
    },
    {
      id: 3,
      name: "Sea Ray 250 SLX",
      image: "https://images.unsplash.com/photo-1554254648-2d58a1bc3fd5?auto=format&fit=crop&q=80&w=500",
      price: 9000,
      description: "Роскошный катер для особых случаев",
    },
  ];

  const advantages = [
    {
      icon: "Anchor",
      title: "Современный флот",
      description: "Наши лодки регулярно проходят техническое обслуживание",
    },
    {
      icon: "Shield",
      title: "Безопасность",
      description: "Все лодки оснащены спасательным оборудованием",
    },
    {
      icon: "Clock",
      title: "Гибкие условия аренды",
      description: "От нескольких часов до нескольких дней",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Навигация */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Sailboat" className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-blue-800">МорскойПрокат</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="font-medium text-blue-800 hover:text-blue-600">Главная</Link>
            <Link to="/catalog" className="font-medium text-gray-600 hover:text-blue-600">Каталог</Link>
            <Link to="/about" className="font-medium text-gray-600 hover:text-blue-600">О нас</Link>
            <Link to="/contacts" className="font-medium text-gray-600 hover:text-blue-600">Контакты</Link>
            <Link to="/cart" className="flex items-center gap-1">
              <Icon name="ShoppingCart" className="text-gray-600" />
              <span className="text-gray-600">Корзина</span>
            </Link>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Icon name="Menu" />
            </Button>
          </div>
        </div>
      </header>

      {/* Главный баннер */}
      <section className="bg-[url('https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80')] bg-cover bg-center py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-lg inline-block">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Прокат моторных лодок
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Исследуйте водные просторы с комфортом — лучшие лодки для незабываемого отдыха на воде
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Выбрать лодку
                <Icon name="ArrowRight" className="ml-2" size={18} />
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные лодки */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Популярные модели лодок</h2>
          
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {featuredBoats.map((boat) => (
                <CarouselItem key={boat.id} className="md:basis-1/2 lg:basis-1/3 p-2">
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={boat.image} 
                        alt={boat.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{boat.name}</h3>
                      <p className="text-gray-600 mb-4">{boat.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-bold">{boat.price} ₽/день</span>
                        <Button size="sm" variant="outline">Арендовать</Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4 gap-2">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
          
          <div className="text-center mt-10">
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Смотреть все лодки
                <Icon name="ChevronRight" className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">Как арендовать лодку</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Всего несколько простых шагов отделяют вас от незабываемого отдыха на воде
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Выберите лодку</h3>
              <p className="text-gray-600">Просмотрите наш каталог и выберите подходящую модель</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CalendarDays" className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Забронируйте дату</h3>
              <p className="text-gray-600">Выберите удобное время для аренды лодки</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Sailboat" className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Отправляйтесь в путь</h3>
              <p className="text-gray-600">Получите лодку и наслаждайтесь отдыхом на воде</p>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Почему выбирают нас</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Icon name={advantage.icon} className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы к приключениям на воде?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Забронируйте лодку прямо сейчас и получите скидку 10% на первую аренду
          </p>
          <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
            Забронировать лодку
          </Button>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Sailboat" className="text-blue-400" size={24} />
                <span className="text-xl font-bold">МорскойПрокат</span>
              </div>
              <p className="text-gray-400">
                Лучший сервис проката моторных лодок в вашем регионе
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Навигация</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Главная</Link></li>
                <li><Link to="/catalog" className="text-gray-400 hover:text-white">Каталог</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">О нас</Link></li>
                <li><Link to="/contacts" className="text-gray-400 hover:text-white">Контакты</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <Icon name="MapPin" size={18} className="mt-1 flex-shrink-0" />
                  <span>ул. Портовая, 123, г. Приморск</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Phone" size={18} className="mt-1 flex-shrink-0" />
                  <span>+7 (999) 123-45-67</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Mail" size={18} className="mt-1 flex-shrink-0" />
                  <span>info@морскойпрокат.рф</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Режим работы</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Пн-Пт: 9:00 - 20:00</li>
                <li>Сб-Вс: 10:00 - 19:00</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} МорскойПрокат. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
