
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  days: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, days: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Загружаем данные корзины из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Ошибка при загрузке корзины:", error);
      }
    }
  }, []);
  
  // Сохраняем данные корзины в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);
  
  // Добавление товара в корзину
  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      // Проверяем, есть ли такой товар уже в корзине
      const existingItemIndex = prev.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть, увеличиваем количество дней
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].days += newItem.days;
        return updatedItems;
      } else {
        // Если товара нет, добавляем его
        return [...prev, newItem];
      }
    });
  };
  
  // Удаление товара из корзины
  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Обновление количества дней аренды
  const updateQuantity = (id: number, days: number) => {
    if (days < 1) return;
    
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, days } 
          : item
      )
    );
  };
  
  // Очистка корзины
  const clearCart = () => {
    setItems([]);
  };
  
  // Вычисление общего количества товаров
  const totalItems = items.reduce((sum, item) => sum + 1, 0);
  
  // Вычисление общей стоимости
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.days), 0);
  
  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return context;
};
