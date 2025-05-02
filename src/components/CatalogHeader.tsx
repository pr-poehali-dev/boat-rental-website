
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";
import { useCart } from "@/hooks/use-cart";

const CatalogHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  
  const cartItemsCount = items.length;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
            <div className="flex items-center gap-2">
              <Icon name="Sailboat" className="text-blue-600" size={28} />
              <span className="text-xl font-bold text-blue-800">МорскойПрокат</span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="font-medium text-gray-600 hover:text-blue-600">Главная</Link>
          <Link to="/catalog" className="font-medium text-blue-800 hover:text-blue-600">Каталог</Link>
          <Link to="/about" className="font-medium text-gray-600 hover:text-blue-600">О нас</Link>
          <Link to="/contacts" className="font-medium text-gray-600 hover:text-blue-600">Контакты</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/cart" className="flex items-center gap-1 relative">
            <Icon name="ShoppingCart" className="text-gray-700" size={22} />
            <span className="sr-only">Корзина</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>
          
          <div className="hidden md:block">
            <Button size="sm" variant="outline" className="mr-2" asChild>
              <Link to="/login">Войти</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Регистрация</Link>
            </Button>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Icon name="Menu" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex-1 py-6">
                  <nav className="flex flex-col gap-4">
                    <Link 
                      to="/" 
                      className="flex items-center py-2 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon name="Home" className="mr-3" size={18} />
                      Главная
                    </Link>
                    <Link 
                      to="/catalog" 
                      className="flex items-center py-2 text-blue-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon name="Sailboat" className="mr-3" size={18} />
                      Каталог
                    </Link>
                    <Link 
                      to="/about" 
                      className="flex items-center py-2 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon name="Info" className="mr-3" size={18} />
                      О нас
                    </Link>
                    <Link 
                      to="/contacts" 
                      className="flex items-center py-2 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon name="Phone" className="mr-3" size={18} />
                      Контакты
                    </Link>
                    <Link 
                      to="/cart" 
                      className="flex items-center py-2 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon name="ShoppingCart" className="mr-3" size={18} />
                      Корзина
                      {cartItemsCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                  </nav>
                </div>
                <div className="py-6 border-t">
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Войти
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        Регистрация
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
