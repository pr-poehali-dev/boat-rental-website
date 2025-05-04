
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Booking } from "@/types/api.types";

type ExportFormat = "csv" | "excel";
type DateRange = "all" | "week" | "month" | "quarter";

interface ExportField {
  id: string;
  label: string;
  selected: boolean;
}

const BookingExport = () => {
  // Форматы экспорта
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  // Диапазон дат
  const [dateRange, setDateRange] = useState<DateRange>("all");
  // Поля для экспорта
  const [fields, setFields] = useState<ExportField[]>([
    { id: "id", label: "ID бронирования", selected: true },
    { id: "boatName", label: "Название лодки", selected: true },
    { id: "clientName", label: "Имя клиента", selected: true },
    { id: "clientEmail", label: "Email клиента", selected: true },
    { id: "clientPhone", label: "Телефон клиента", selected: true },
    { id: "startDate", label: "Дата начала", selected: true },
    { id: "endDate", label: "Дата окончания", selected: true },
    { id: "totalPrice", label: "Общая стоимость", selected: true },
    { id: "status", label: "Статус", selected: true },
    { id: "createdAt", label: "Дата создания", selected: true },
    { id: "notes", label: "Примечания", selected: false },
  ]);

  // Состояние для отслеживания прогресса экспорта
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Получение данных о бронированиях
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.bookings.getAll();
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при загрузке бронирований');
      }
      return response.data;
    }
  });

  // Обработчик изменения выбора полей
  const handleFieldChange = (fieldId: string, checked: boolean) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, selected: checked } : field
    ));
  };

  // Обработчик выбора/снятия выбора со всех полей
  const handleSelectAllFields = (checked: boolean) => {
    setFields(fields.map(field => ({ ...field, selected: checked })));
  };

  // Функция для экспорта данных
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      
      // Фильтрация бронирований по выбранному диапазону дат
      let filteredBookings = [...bookings];
      const today = new Date();
      
      if (dateRange !== "all") {
        const getDaysToSubtract = () => {
          switch (dateRange) {
            case "week": return 7;
            case "month": return 30;
            case "quarter": return 90;
            default: return 0;
          }
        };
        
        const daysToSubtract = getDaysToSubtract();
        const startDate = new Date();
        startDate.setDate(today.getDate() - daysToSubtract);
        
        filteredBookings = bookings.filter((booking: Booking) => 
          new Date(booking.createdAt) >= startDate
        );
      }
      
      // Имитация процесса экспорта с прогрессом
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(Math.floor((i / totalSteps) * 100));
      }
      
      // Подготовка данных для экспорта (выбранные поля)
      const selectedFields = fields.filter(field => field.selected).map(field => field.id);
      
      const exportData = filteredBookings.map((booking: any) => {
        const bookingData: Record<string, any> = {};
        selectedFields.forEach(fieldId => {
          bookingData[fieldId] = booking[fieldId];
        });
        return bookingData;
      });
      
      // Генерация CSV или Excel
      if (exportFormat === "csv") {
        exportToCSV(exportData);
      } else {
        // В реальном приложении здесь был бы код для экспорта в Excel
        // Для демонстрации используем CSV
        exportToCSV(exportData);
      }
      
      setIsExporting(false);
      setExportProgress(0);
      
    } catch (error) {
      console.error("Ошибка при экспорте данных:", error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Функция для экспорта в CSV
  const exportToCSV = (data: any[]) => {
    if (data.length === 0) return;
    
    // Получаем названия колонок из первого объекта
    const headers = Object.keys(data[0]);
    
    // Создаем строки CSV
    const csvRows = [];
    
    // Добавляем заголовки
    csvRows.push(headers.join(','));
    
    // Добавляем данные
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        // Обрабатываем специальные символы для CSV
        return `"${val?.toString().replace(/"/g, '""') || ''}"`;
      });
      csvRows.push(values.join(','));
    }
    
    // Объединяем все строки
    const csvString = csvRows.join('\n');
    
    // Создаем blob и ссылку для скачивания
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Имитируем клик по ссылке для скачивания файла
    link.click();
    
    // Очищаем
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Экспорт данных бронирований</CardTitle>
        <CardDescription>Выгрузите данные о бронированиях в удобном формате для дальнейшего анализа</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Загрузка данных...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Настройки экспорта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Выбор формата */}
              <div>
                <Label htmlFor="export-format" className="mb-2 block">Формат экспорта</Label>
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Диапазон дат */}
              <div>
                <Label htmlFor="date-range" className="mb-2 block">Диапазон дат</Label>
                <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                  <SelectTrigger id="date-range">
                    <SelectValue placeholder="Выберите диапазон" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все время</SelectItem>
                    <SelectItem value="week">Последняя неделя</SelectItem>
                    <SelectItem value="month">Последний месяц</SelectItem>
                    <SelectItem value="quarter">Последний квартал</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Выбор полей для экспорта */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Поля для экспорта</Label>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="select-all"
                    checked={fields.every(field => field.selected)}
                    onCheckedChange={handleSelectAllFields}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer">Выбрать все</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {fields.map(field => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Checkbox 
                      id={`field-${field.id}`}
                      checked={field.selected}
                      onCheckedChange={(checked) => handleFieldChange(field.id, checked as boolean)}
                    />
                    <Label htmlFor={`field-${field.id}`} className="cursor-pointer">{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Статистика и кнопка экспорта */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Всего записей для экспорта: <span className="font-medium">{bookings.length}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Выбрано полей: <span className="font-medium">{fields.filter(f => f.selected).length} из {fields.length}</span>
                  </p>
                </div>
                
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting || !fields.some(f => f.selected)} 
                  className="gap-2"
                >
                  {isExporting ? (
                    <>
                      <Icon name="Loader2" className="animate-spin" size={16} />
                      Экспорт ({exportProgress}%)
                    </>
                  ) : (
                    <>
                      <Icon name="FileDown" size={16} />
                      Скачать {exportFormat.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
              
              {isExporting && (
                <div className="w-full h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingExport;
