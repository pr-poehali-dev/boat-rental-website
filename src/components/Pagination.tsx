
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) => {
  // Если страниц меньше 2, не показываем пагинацию
  if (totalPages <= 1) return null;

  // Генерируем диапазон чисел от start до end
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Создаем массив страниц для отображения
  const generatePaginationItems = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // Соседи + текущая + первая + последняя
    
    // Если общее количество страниц меньше, чем нужно
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }
    
    // Вычисляем левую и правую границы соседних страниц
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Определяем, нужно ли показывать многоточие
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Формируем массив страниц в зависимости от ситуации
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Начало списка, многоточие справа
      const leftRange = range(1, rightSiblingIndex);
      return [...leftRange, "ellipsis", totalPages];
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Конец списка, многоточие слева
      const rightRange = range(leftSiblingIndex, totalPages);
      return [1, "ellipsis", ...rightRange];
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      // Посередине, многоточие с обеих сторон
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, "ellipsis", ...middleRange, "ellipsis", totalPages];
    }
    
    // Если не подходит ни одно из условий выше
    return range(1, totalPages);
  };

  const paginationItems = generatePaginationItems();

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Кнопка "Предыдущая страница" */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Предыдущая страница"
      >
        <Icon name="ChevronLeft" size={16} />
      </Button>
      
      {/* Номера страниц и многоточия */}
      {paginationItems.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span 
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-10 h-10 text-gray-500"
            >
              ...
            </span>
          );
        }
        
        return (
          <Button
            key={item}
            variant={currentPage === item ? "default" : "outline"}
            className={`w-10 h-10 ${currentPage === item ? "pointer-events-none" : ""}`}
            onClick={() => onPageChange(item as number)}
            aria-label={`Страница ${item}`}
            aria-current={currentPage === item ? "page" : undefined}
          >
            {item}
          </Button>
        );
      })}
      
      {/* Кнопка "Следующая страница" */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Следующая страница"
      >
        <Icon name="ChevronRight" size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
