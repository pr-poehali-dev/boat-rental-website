
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import CatalogHeader from "@/components/CatalogHeader";
import { useCart } from "@/hooks/use-cart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type OrderFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  comments: string;
};

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    comments: "",
  });
  const [showOrderSuccessDialog, setShowOrderSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateQuantity = (id: number, days: number) => {
    if (days < 1) return;
    updateQuantity(id, days);
  };

  const handleApplyPromoCode = () => {
    // Простой пример проверки промокода
    if (promoCode === "BOAT10") {
      setDiscount(10);
      setPromoError("");
      toast({
        title: "Промокод применен",
        description: "Скидка 10% добавлена к заказу",
        variant: "default",
      });
    } else {
      setDiscount(0);
      setPromoError("Недействительный промокод");
    }
  };

  const finalPrice = totalPrice - (totalPrice * discount) / 100;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Имитация отправки заказа на сервер
    setTimeout(() => {
      setLoading(false);
      setShowOrderSuccessDialog(true);
      clearCart();
    }, 1500);
  };

  const emptyCart = items.length === 0;

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
            <span className="text-gray-900">Корзина</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Корзина</h1>

        {emptyCart ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Icon
              name="ShoppingCart"
              size={48}
              className="mx-auto text-gray-300 mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">Ваша корзина пуста</h2>
            <p className="text-gray-600 mb-6">
              Добавьте понравившиеся лодки в корзину для оформления аренды
            </p>
            <Button asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Товар</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead className="text-right">Цена за день</TableHead>
                      <TableHead className="text-center">Кол-во дней</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/boat/${item.id}`}
                            className="font-medium hover:text-blue-600"
                          >
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.price} ₽
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.days - 1)
                              }
                              disabled={item.days <= 1}
                            >
                              <Icon name="Minus" size={14} />
                            </Button>
                            <span className="w-10 text-center">{item.days}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.days + 1)
                              }
                            >
                              <Icon name="Plus" size={14} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.price * item.days} ₽
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 flex justify-between items-center border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCart()}
                  >
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Очистить корзину
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/catalog">
                      <Icon name="ArrowLeft" className="mr-2" size={16} />
                      Продолжить выбор
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Информация для оформления
                </h2>
                <form onSubmit={handleSubmitOrder}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Имя и фамилия *
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
                        Телефон *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Адрес *
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="comments"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Комментарии к заказу
                      </label>
                      <Input
                        id="comments"
                        name="comments"
                        value={formData.comments}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-lg font-semibold mb-4">Сумма заказа</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Стоимость аренды:</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Скидка ({discount}%):</span>
                      <span>-{(totalPrice * discount) / 100} ₽</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого:</span>
                    <span>{finalPrice} ₽</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="promoCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Промокод
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Введите промокод"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={handleApplyPromoCode}
                      >
                        Применить
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-red-500 text-sm mt-1">{promoError}</p>
                    )}
                    {discount > 0 && (
                      <p className="text-green-600 text-sm mt-1">
                        Промокод успешно применен!
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmitOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Icon
                          name="Loader2"
                          className="mr-2 animate-spin"
                          size={18}
                        />
                        Оформление...
                      </>
                    ) : (
                      "Оформить заказ"
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center mt-2">
                    Нажимая кнопку, вы соглашаетесь с условиями аренды и
                    политикой конфиденциальности
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Диалог успешного оформления заказа */}
        <Dialog
          open={showOrderSuccessDialog}
          onOpenChange={setShowOrderSuccessDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                Заказ успешно оформлен!
              </DialogTitle>
              <DialogDescription className="text-center">
                Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для
                подтверждения деталей.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <Icon
                name="CheckCircle"
                className="text-green-500"
                size={64}
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-center">
              <Button onClick={() => setShowOrderSuccessDialog(false)} asChild>
                <Link to="/">Вернуться на главную</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Cart;
