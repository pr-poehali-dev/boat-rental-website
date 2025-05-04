
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import BoatDetail from "./pages/BoatDetail";
import BookingPage from "./pages/BookingPage";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminBoats, AdminBookings } from "./pages/admin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/boat/:id" element={<BoatDetail />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Защищенные маршруты для пользователей */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  {/* Здесь будет компонент профиля пользователя */}
                  <div>Профиль пользователя</div>
                </ProtectedRoute>
              } />
              
              {/* Маршруты административной панели */}
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<div>Обзор администратора</div>} />
                <Route path="boats" element={<AdminBoats />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="users" element={<div>Управление пользователями</div>} />
                <Route path="reviews" element={<div>Управление отзывами</div>} />
                <Route path="settings" element={<div>Настройки</div>} />
              </Route>
              
              {/* Маршрут "404 - не найдено" */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
