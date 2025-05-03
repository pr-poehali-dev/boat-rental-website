
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  adminOnly = false 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Показываем индикатор загрузки, пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="container flex justify-center items-center min-h-screen py-10">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуется доступ администратора, но пользователь не админ
  if (adminOnly && !isAdmin) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  // Если все проверки пройдены, показываем защищенный контент
  return <>{children}</>;
};
