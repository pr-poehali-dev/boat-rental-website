
import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import CatalogHeader from "@/components/CatalogHeader";
import BoatCard from "@/components/BoatCard";
import Pagination from "@/components/Pagination";
import ActiveFilters, { FilterItem } from "@/components/ActiveFilters";
import { boats, BoatType } from "@/data/boats";
import { useToast } from "@/components/ui/use-toast";

type SortOption = "popular" | "priceAsc" | "priceDesc" | "newest";

interface Filters {
  searchQuery: string;
  priceRange: [number, number];
  categories: string[];
  capacity: number | null;
}

const ITEMS_PER_PAGE = 9;

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Получаем параметры из URL
  const initialPage = parseInt(searchParams.get("page") || "1");
  const initialSort = (searchParams.get("sort") as SortOption) || "popular";
  const initialSearch = searchParams.get("search") || "";
  const initialCategories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const initialCapacity = searchParams.get("capacity") ? parseInt(searchParams.get("capacity") || "0") : null;
  
  const minPrice = Math.min(...boats.map(boat => boat.price));
  const maxPrice = Math.max(...boats.map(boat => boat.price));
  
  const initialMinPrice = parseInt(searchParams.get("minPrice") || minPrice.toString());
  const initialMaxPrice = parseInt(searchParams.get("maxPrice") || maxPrice.toString());
  
  // Состояния для UI
  const [filteredBoats, setFilteredBoats] = useState<BoatType[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortOption, setSortOption] = useState<SortOption>(initialSort);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Состояние фильтров
  const [filters, setFilters] = useState<Filters>({
    searchQuery: initialSearch,
    priceRange: [initialMinPrice, initialMaxPrice],
    categories: initialCategories,
    capacity: initialCapacity,
  });

  const categories = [
    { id: "fishing", label: "Рыболовные" },
    { id: "family", label: "Семейные" },
    { id: "sport", label: "Спортивные" },
    { id: "luxury", label: "Премиум" },
  ];

  const capacityOptions = [
    { value: 2, label: "2 человека" },
    { value: 4, label: "4 человека" },
    { value: 6, label: "6 человек" },
    { value: 8, label: "8+ человек" },
  ];

  // Фильтрация лодок на основе фильтров
  useEffect(() => {
    let result = boats;
    
    // Фильтрация по поисковому запросу
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(boat => 
        boat.name.toLowerCase().includes(query) || 
        boat.description.toLowerCase().includes(query)
      );
    }
    
    // Фильтрация по цене
    result = result.filter(boat => 
      boat.price >= filters.priceRange[0] && 
      boat.price <= filters.priceRange[1]
    );
    
    // Фильтрация по категориям
    if (filters.categories.length > 0) {
      result = result.filter(boat => 
        filters.categories.some(category => 
          boat.categories.includes(category)
        )
      );
    }
    
    // Фильтрация по вместимости
    if (filters.capacity) {
      result = result.filter(boat => boat.capacity >= filters.capacity!);
    }
    
    // Сортировка
    switch (sortOption) {
      case "priceAsc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = [...result].sort((a, b) => b.id - a.id);
        break;
      case "popular":
      default:
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }
    
    setFilteredBoats(result);
    
    // При изменении фильтров сбрасываем на первую страницу
    setCurrentPage(1);

    // Обновляем URL с параметрами фильтрации
    updateURLParams();
  }, [filters, sortOption]);

  // Обновление URL при изменении страницы
  useEffect(() => {
    updateURLParams();
  }, [currentPage]);

  // Функция для обновления URL с параметрами
  const updateURLParams = () => {
    const params = new URLSearchParams();
    
    // Добавляем параметры только если они отличаются от значений по умолчанию
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortOption !== "popular") params.set("sort", sortOption);
    if (filters.searchQuery) params.set("search", filters.searchQuery);
    if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
    if (filters.capacity) params.set("capacity", filters.capacity.toString());
    if (filters.priceRange[0] !== minPrice) params.set("minPrice", filters.priceRange[0].toString());
    if (filters.priceRange[1] !== maxPrice) params.set("maxPrice", filters.priceRange[1].toString());
    
    setSearchParams(params);
  };

  // Вычисляем активные фильтры для отображения
  const activeFilters = useMemo<FilterItem[]>(() => {
    const result: FilterItem[] = [];
    
    if (filters.searchQuery) {
      result.push({
        id: "search",
        label: "Поиск",
        value: filters.searchQuery,
        type: "search"
      });
    }
    
    if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) {
      result.push({
        id: "price",
        label: "Цена",
        value: filters.priceRange,
        type: "price"
      });
    }
    
    filters.categories.forEach(categoryId => {
      result.push({
        id: `category-${categoryId}`,
        label: "Категория",
        value: categoryId,
        type: "category"
      });
    });
    
    if (filters.capacity) {
      result.push({
        id: "capacity",
        label: "Вместимость",
        value: filters.capacity,
        type: "capacity"
      });
    }
    
    return result;
  }, [filters]);

  // Обработчики изменения фильтров
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleCapacityChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      capacity: value ? parseInt(value) : null
    }));
  };

  // Обработчик удаления активного фильтра
  const handleRemoveFilter = (filter: FilterItem) => {
    switch (filter.type) {
      case "search":
        setFilters(prev => ({ ...prev, searchQuery: "" }));
        break;
      case "price":
        setFilters(prev => ({ ...prev, priceRange: [minPrice, maxPrice] }));
        break;
      case "category":
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c !== filter.value)
        }));
        break;
      case "capacity":
        setFilters(prev => ({ ...prev, capacity: null }));
        break;
    }
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      priceRange: [minPrice, maxPrice],
      categories: [],
      capacity: null,
    });
    setSortOption("popular");
    setCurrentPage(1);
    
    // Очищаем URL-параметры
    navigate("/catalog");
    
    toast({
      title: "Фильтры сброшены",
      description: "Все параметры фильтрации были сброшены до значений по умолчанию",
    });
  };

  // Пагинация
  const totalPages = Math.ceil(filteredBoats.length / ITEMS_PER_PAGE);
  const currentBoats = filteredBoats.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <CatalogHeader />

      {/* Хлебные крошки */}
      <div className="bg-white py-3 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <Icon name="ChevronRight" size={16} className="mx-2" />
            <span className="text-gray-900">Каталог лодок</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок и кнопка фильтров для мобильных */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Каталог моторных лодок</h1>
            <p className="text-gray-600">Найдено {filteredBoats.length} лодок</p>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 sm:mt-0 md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icon name="SlidersHorizontal" size={16} className="mr-2" />
            {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Сайдбар с фильтрами */}
          <div className={`w-full md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Фильтры</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Сбросить
                  </Button>
                </div>

                {/* Поиск */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Поиск</h3>
                  <div className="relative">
                    <Input 
                      placeholder="Название или описание" 
                      value={filters.searchQuery}
                      onChange={handleSearchChange}
                    />
                    {filters.searchQuery && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-full" 
                        onClick={() => setFilters(prev => ({ ...prev, searchQuery: "" }))}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Цена */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-4">Цена за день (₽)</h3>
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={500}
                    value={[filters.priceRange[0], filters.priceRange[1]]}
                    onValueChange={handlePriceChange}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>{filters.priceRange[0]} ₽</span>
                    <span>{filters.priceRange[1]} ₽</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Категории */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Категории</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox 
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`category-${category.id}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Вместимость */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Вместимость</h3>
                  <Select
                    value={filters.capacity?.toString() || ""}
                    onValueChange={handleCapacityChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Любая вместимость" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Любая вместимость</SelectItem>
                      {capacityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Основной контент */}
          <div className="flex-1">
            {/* Сортировка и вид отображения */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 min-w-[180px]">
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">По популярности</SelectItem>
                    <SelectItem value="priceAsc">По возрастанию цены</SelectItem>
                    <SelectItem value="priceDesc">По убыванию цены</SelectItem>
                    <SelectItem value="newest">Сначала новые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex border rounded overflow-hidden ml-4">
                <Button
                  variant={viewType === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewType("grid")}
                  className="rounded-none"
                >
                  <Icon name="LayoutGrid" size={18} />
                </Button>
                <Button
                  variant={viewType === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewType("list")}
                  className="rounded-none"
                >
                  <Icon name="List" size={18} />
                </Button>
              </div>
            </div>

            {/* Активные фильтры */}
            {activeFilters.length > 0 && (
              <ActiveFilters 
                filters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onResetAll={resetFilters}
                categories={categories}
              />
            )}

            {/* Список лодок */}
            {currentBoats.length > 0 ? (
              <div className={
                viewType === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {currentBoats.map(boat => (
                  <BoatCard 
                    key={boat.id} 
                    boat={boat} 
                    viewType={viewType}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg border">
                <Icon name="SearchX" size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">Лодки не найдены</h3>
                <p className="text-gray-600 mb-6">
                  Попробуйте изменить параметры фильтрации
                </p>
                <Button onClick={resetFilters}>Сбросить фильтры</Button>
              </div>
            )}

            {/* Пагинация */}
            {filteredBoats.length > ITEMS_PER_PAGE && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
