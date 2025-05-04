
import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Icon from "@/components/ui/icon";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import BookingStatistics from "@/components/admin/BookingStatistics";
import BoatOccupancyChart from "@/components/admin/BoatOccupancyChart";

// Элемент меню административной панели
interface AdminMenuItem {
  label: string;
  path: string;
  icon: string;
}

// Разделы административной панели
const adminMenuItems: AdminMenuItem[] = [
  { label: "Обзор", path: "/admin", icon: "LayoutDashboard" },
  { label: "Лодки", path: "/admin/boats", icon: "Boat" },
  { label: "Бронирования", path: "/admin/bookings", icon: "Calendar" },
  { label: "Пользователи", path: "/admin/users", icon: "Users" },
  { label: "Отзывы", path: "/admin/reviews", icon: "MessageSquare" },
  { label: "Настройки", path: "/admin/settings", icon: "Settings" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Обработчик для выхода из аккаунта
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Определяем текущий активный раздел
  const currentPath = location.pathname;
  const currentSection = adminMenuItems.find(
    item => currentPath === item.path || currentPath.startsWith(`${item.path}/`)
  );

  // Компонент элемента меню
  const MenuItem = ({ item }: { item: AdminMenuItem }) => {
    const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
    
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon name={item.icon} size={20} />
        <span>{item.label}</span>
      </Link>
    );
  };

  // Проверяем, находимся ли мы на главной странице административной панели
  const isOverviewPage = currentPath === "/admin";

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-background">
        {/* Боковое меню для десктопов */}
        <aside className="hidden lg:flex flex-col w-64 border-r p-4 space-y-4">
          <div className="flex items-center gap-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Icon name="ShieldCheck" size={18} />
            </div>
            <span className="font-bold text-lg">Админ-панель</span>
          </div>
          
          <Separator />
          
          <nav className="space-y-1">
            {adminMenuItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </nav>
          
          <div className="mt-auto space-y-4">
            <Separator />
            
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Icon name="User" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={handleLogout}
            >
              <Icon name="LogOut" size={16} />
              Выйти
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2" 
              onClick={() => navigate("/")}
            >
              <Icon name="ArrowLeft" size={16} />
              Вернуться на сайт
            </Button>
          </div>
        </aside>

        {/* Адаптивное меню для мобильных устройств */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Icon name="ShieldCheck" size={18} />
              </div>
              <span className="font-bold text-lg">Админ-панель</span>
            </div>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="Menu" size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-4 border-b">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Icon name="ShieldCheck" size={18} />
                    </div>
                    <span className="font-bold text-lg">Админ-панель</span>
                  </div>
                  
                  <nav className="p-4 space-y-1">
                    {adminMenuItems.map((item) => (
                      <MenuItem key={item.path} item={item} />
                    ))}
                  </nav>
                  
                  <div className="mt-auto p-4 space-y-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Icon name="User" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2" 
                      onClick={handleLogout}
                    >
                      <Icon name="LogOut" size={16} />
                      Выйти
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2" 
                      onClick={() => navigate("/")}
                    >
                      <Icon name="ArrowLeft" size={16} />
                      Вернуться на сайт
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Основной контент */}
        <main className="flex-1 min-w-0 lg:p-8 p-4 lg:pt-8 pt-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{currentSection?.label || "Административная панель"}</h1>
            <p className="text-muted-foreground">Управление данными сайта аренды лодок</p>
          </div>

          {isOverviewPage ? (
            <div className="space-y-6">
              <BookingStatistics />
              <BoatOccupancyChart />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
