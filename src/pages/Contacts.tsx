
import { useState } from "react";
import { Link } from "react-router-dom";
import CatalogHeader from "@/components/CatalogHeader";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Имитация отправки формы
    setTimeout(() => {
      toast({
        title: "Сообщение отправлено",
        description: "Мы свяжемся с вами в ближайшее время!",
      });
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader />

      {/* Хлебные крошки */}
      <div className="bg-white py-3 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">
              Главная
            </Link>
            <Icon name="ChevronRight" size={16} className="mx-2" />
            <span className="text-gray-900">Контакты</span>
          </div>
        </div>
      </div>

      {/* Заголовок */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Контакты</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Будем рады ответить на все ваши вопросы и помочь с выбором
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-900">
              Наши контакты
            </h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Icon name="MapPin" className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                  <p className="text-gray-600">
                    ул. Портовая, 123, г. Приморск, <br />
                    Морской район, 123456
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Icon name="Phone" className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                  <p className="text-gray-600">
                    <a href="tel:+79991234567" className="hover:text-blue-600">
                      +7 (999) 123-45-67
                    </a>
                    <br />
                    <a href="tel:+79991234568" className="hover:text-blue-600">
                      +7 (999) 123-45-68
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Icon name="Mail" className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">
                    <a
                      href="mailto:info@морскойпрокат.рф"
                      className="hover:text-blue-600"
                    >
                      info@морскойпрокат.рф
                    </a>
                    <br />
                    <a
                      href="mailto:support@морскойпрокат.рф"
                      className="hover:text-blue-600"
                    >
                      support@морскойпрокат.рф
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Icon name="Clock" className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Режим работы
                  </h3>
                  <p className="text-gray-600">
                    Пн-Пт: 9:00 - 20:00
                    <br />
                    Сб-Вс: 10:00 - 19:00
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-semibold text-gray-900 mb-4">
                Мы в социальных сетях
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Icon name="Facebook" size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                >
                  <Icon name="Twitter" size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
                >
                  <Icon name="Instagram" size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                >
                  <Icon name="Youtube" size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-900">
              Обратная связь
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Имя *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Телефон
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Сообщение *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Icon
                          name="Loader2"
                          className="mr-2 animate-spin"
                          size={18}
                        />
                        Отправка...
                      </>
                    ) : (
                      "Отправить сообщение"
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Нажимая кнопку, вы соглашаетесь с политикой
                    конфиденциальности
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Карта */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Как нас найти</h2>
          <div className="rounded-lg overflow-hidden shadow-sm h-96 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <Icon name="Map" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Здесь будет расположена карта с местоположением компании
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">
            Остались вопросы?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Ознакомьтесь с разделом часто задаваемых вопросов, чтобы получить быстрые ответы на популярные вопросы
          </p>
          <Button asChild variant="outline">
            <Link to="/about">
              Перейти в раздел FAQ
              <Icon name="ArrowRight" className="ml-2" size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
