
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export interface FilterItem {
  id: string;
  label: string;
  value: string | number | [number, number];
  type: "search" | "category" | "price" | "capacity";
}

interface ActiveFiltersProps {
  filters: FilterItem[];
  onRemoveFilter: (filter: FilterItem) => void;
  onResetAll: () => void;
  categories: Array<{ id: string; label: string }>;
}

const ActiveFilters = ({
  filters,
  onRemoveFilter,
  onResetAll,
  categories,
}: ActiveFiltersProps) => {
  if (filters.length === 0) return null;

  // Функция для форматирования значения фильтра в читаемый вид
  const formatFilterValue = (filter: FilterItem) => {
    switch (filter.type) {
      case "search":
        return `"${filter.value}"`;
      case "category":
        const category = categories.find(c => c.id === filter.value);
        return category ? category.label : filter.value;
      case "price":
        if (Array.isArray(filter.value)) {
          return `${filter.value[0]} - ${filter.value[1]} ₽`;
        }
        return `${filter.value} ₽`;
      case "capacity":
        return `${filter.value}+ человек`;
      default:
        return String(filter.value);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Активные фильтры:</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onResetAll}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Сбросить все
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <Badge 
            key={filter.id} 
            variant="outline"
            className="rounded-full px-3 py-1 bg-gray-100"
          >
            <span className="text-sm text-gray-700">
              {filter.label}: {formatFilterValue(filter)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 ml-1 hover:bg-gray-200 rounded-full"
              onClick={() => onRemoveFilter(filter)}
            >
              <Icon name="X" size={12} />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;
