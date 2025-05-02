
import { Link } from "react-router-dom";
import CatalogHeader from "@/components/CatalogHeader";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = () => {
  const teamMembers = [
    {
      name: "Алексей Морской",
      position: "Основатель и CEO",
      photo: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&q=80&w=300",
      description: "Опытный моряк с 15-летним стажем управления различными судами."
    },
    {
      name: "Марина Волкова",
      position: "Руководитель сервиса",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
      description: "Отвечает за техническое состояние лодок и качество обслуживания."
    },
    {
      name: "Дмитрий Речной",
      position: "Менеджер по работе с клиентами",
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
      description: "Поможет подобрать идеальную лодку для любого мероприятия."
    }
  ];

  const faqs = [
    {
      question: "Какие документы нужны для аренды лодки?",
      answer: "Для аренды лодки вам потребуется: удостоверение личности (паспорт), права на управление маломерным судном соответствующей категории, залог (может быть в виде денежных средств или документов). Подробные требования зависят от конкретной лодки и указаны в описании."
    },
    {
      question: "Можно ли арендовать лодку без прав?",
      answer: "Да, мы предлагаем несколько вариантов для клиентов без прав: аренда лодки с капитаном, аренда лодок, для которых не требуются права (маломощные моторные лодки до 8 кВт). Уточняйте возможности при бронировании."
    },
    {
      question: "Какой залог требуется при аренде?",
      answer: "Размер залога зависит от стоимости и класса лодки. Обычно он составляет от 10 000 до 50 000 рублей. Залог возвращается полностью после проверки лодки при возврате, если нет повреждений или нарушений условий аренды."
    },
    {
      question: "Что делать, если лодка сломалась во время аренды?",
      answer: "В случае поломки немедленно свяжитесь с нашей службой поддержки по номеру, указанному в договоре. Мы организуем техническую помощь или замену лодки в кратчайшие сроки. Если поломка произошла не по вине арендатора, мы компенсируем неиспользованное время аренды."
    },
    {
      question: "Есть ли скидки на длительную аренду?",
      answer: "Да, мы предоставляем скидки при аренде на длительный срок: 5% при аренде от 3 дней, 10% при аренде от 7 дней, 15% при аренде от 14 дней. Также действуют сезонные акции и специальные предложения для постоянных клиентов."
    }
  ];

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
            <span className="text-gray-900">О нас</span>
          </div>
        </div>
      </div>

      {/* Баннер с заголовком */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">О компании</h1>
          <p className="text-xl max-w-3xl mx-auto">
            МорскойПрокат — ваш надежный партнер в мире водных приключений с 2015 года
          </p>
        </div>
      </div>

      {/* Основная информация */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-blue-900">
              Наша история
            </h2>
            <div className="space-y-4">
              <p>
                Компания «МорскойПрокат» была основана в 2015 году группой энтузиастов водного спорта и отдыха. Начав с нескольких маломерных судов, мы быстро выросли в один из крупнейших сервисов проката моторных лодок в регионе.
              </p>
              <p>
                За 8 лет мы обслужили более 15 000 клиентов, постоянно расширяя и обновляя наш флот современными и комфортабельными моделями. Наша миссия — сделать водные приключения доступными для всех, кто мечтает о свободе и новых впечатлениях.
              </p>
              <p>
                Сегодня «МорскойПрокат» — это команда профессионалов, которые любят своё дело и стремятся сделать ваш отдых на воде максимально комфортным и безопасным.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild>
                <Link to="/catalog">Выбрать лодку</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1518629585616-c1e3d12c8a25?auto=format&fit=crop&q=80&w=600"
              alt="История компании"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Наши преимущества */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center text-blue-900">
            Почему выбирают нас
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Icon name="Shield" className="text-blue-600" size={24} />
                </div>
                <CardTitle>Безопасность</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Все наши лодки проходят регулярное техническое обслуживание и проверку перед каждой арендой. Мы предоставляем все необходимое спасательное оборудование.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Icon name="LifeBuoy" className="text-blue-600" size={24} />
                </div>
                <CardTitle>Поддержка 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Наша команда всегда на связи. В случае любых вопросов или непредвиденных ситуаций, мы оперативно придем на помощь и решим возникшую проблему.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Icon name="ThumbsUp" className="text-blue-600" size={24} />
                </div>
                <CardTitle>Высокое качество</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  В нашем флоте только современные модели лодок от проверенных производителей. Мы регулярно обновляем парк и следим за техническим состоянием каждого судна.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Наша команда */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center text-blue-900">
            Наша команда
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.position}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Часто задаваемые вопросы */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-900">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Обратная связь */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">
            Остались вопросы?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Наша команда готова ответить на все ваши вопросы и помочь с выбором идеальной лодки для вашего отдыха
          </p>
          <Button asChild size="lg">
            <Link to="/contacts">
              Связаться с нами
              <Icon name="ArrowRight" className="ml-2" size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
