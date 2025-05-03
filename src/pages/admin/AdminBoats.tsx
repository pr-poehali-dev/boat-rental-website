
import { useState } from "react";
import { useBoats } from "@/hooks/useBoats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Icon from "@/components/ui/icon";
import { BoatType } from "@/data/boats";

// Схема валидации для формы лодки
const boatSchema = z.object({
  name: z.string().min(2, { message: "Название должно содержать не менее 2 символов" }),
  description: z.string().min(10, { message: "Описание должно содержать не менее 10 символов" }),
  price: z.number().min(1, { message: "Цена должна быть больше 0" }),
  imageUrl: z.string().url({ message: "Введите корректный URL изображения" }),
  capacity: z.number().min(1, { message: "Вместимость должна быть больше 0" }),
  length: z.number().min(1, { message: "Длина должна быть больше 0" }),
  categories: z.array(z.string()).min(1, { message: "Выберите хотя бы одну категорию" }),
  features: z.array(z.string()).optional(),
});

type BoatFormValues = z.infer<typeof boatSchema>;

export default function AdminBoats() {
  const { toast } = useToast();
  const { boats, isLoading, error, createBoat, updateBoat, deleteBoat, refetch } = useBoats();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<BoatType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Категории лодок (в реальном приложении могут загружаться с сервера)
  const boatCategories = [
    "Парусные", "Моторные", "Каяки", "Каноэ", "Катамараны", "Яхты", "Понтонные", "Рыболовные"
  ];

  // Фильтрация лодок по поисковому запросу
  const filteredBoats = boats.filter(boat => 
    boat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    boat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Форма для добавления/редактирования лодки
  const form = useForm<BoatFormValues>({
    resolver: zodResolver(boatSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      capacity: 1,
      length: 1,
      categories: [],
      features: [],
    }
  });

  // Обработчик отправки формы для добавления новой лодки
  const onSubmitAdd = (data: BoatFormValues) => {
    createBoat({
      ...data,
      id: Date.now(), // В реальном API ID будет генерироваться на сервере
      rating: 0,
      reviews: [],
    });
    
    setIsAddDialogOpen(false);
    form.reset();
    toast({
      title: "Лодка добавлена",
      description: `Лодка "${data.name}" успешно добавлена.`,
    });
  };

  // Обработчик отправки формы для редактирования лодки
  const onSubmitEdit = (data: BoatFormValues) => {
    if (!selectedBoat) return;
    
    updateBoat({
      id: selectedBoat.id,
      data: {
        ...data,
        rating: selectedBoat.rating,
        reviews: selectedBoat.reviews,
      }
    });
    
    setIsEditDialogOpen(false);
    setSelectedBoat(null);
    form.reset();
    toast({
      title: "Лодка обновлена",
      description: `Лодка "${data.name}" успешно обновлена.`,
    });
  };

  // Установка данных выбранной лодки в форму редактирования
  const handleEditBoat = (boat: BoatType) => {
    setSelectedBoat(boat);
    form.reset({
      name: boat.name,
      description: boat.description,
      price: boat.price,
      imageUrl: boat.imageUrl,
      capacity: boat.capacity,
      length: boat.length,
      categories: boat.categories,
      features: boat.features || [],
    });
    setIsEditDialogOpen(true);
  };

  // Обработчик удаления лодки
  const handleDeleteBoat = () => {
    if (!selectedBoat) return;
    
    deleteBoat(selectedBoat.id);
    setIsDeleteDialogOpen(false);
    setSelectedBoat(null);
    toast({
      title: "Лодка удалена",
      description: `Лодка "${selectedBoat.name}" успешно удалена.`,
    });
  };

  // Форма для добавления/редактирования лодки
  const BoatForm = ({ mode }: { mode: "add" | "edit" }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mode === "add" ? onSubmitAdd : onSubmitEdit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input placeholder="Название лодки" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цена (в день)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Цена" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea placeholder="Подробное описание лодки" {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL изображения</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Вместимость</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Количество человек" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Длина (м)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Длина лодки" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категории</FormLabel>
              <div className="flex flex-wrap gap-2">
                {boatCategories.map(category => (
                  <Badge
                    key={category}
                    variant={field.value.includes(category) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => {
                      const newValue = field.value.includes(category)
                        ? field.value.filter(c => c !== category)
                        : [...field.value, category];
                      field.onChange(newValue);
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end mt-4 gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => mode === "add" ? setIsAddDialogOpen(false) : setIsEditDialogOpen(false)}
          >
            Отмена
          </Button>
          <Button type="submit">{mode === "add" ? "Добавить" : "Сохранить"}</Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Произошла ошибка при загрузке лодок"}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Все лодки</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="draft">Черновики</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                placeholder="Поиск лодок..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="md:w-60"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full" 
                  onClick={() => setSearchQuery("")}
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" className="mr-2" size={16} />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Добавить новую лодку</DialogTitle>
                </DialogHeader>
                <BoatForm mode="add" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center p-6">
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Загрузка лодок...
                </div>
              ) : filteredBoats.length === 0 ? (
                <div className="text-center p-6">
                  <Icon name="Boat" className="mx-auto mb-2" size={32} />
                  <h3 className="text-lg font-medium">Лодки не найдены</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Попробуйте изменить параметры поиска" 
                      : "Начните с добавления новой лодки"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Категории</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Рейтинг</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBoats.map(boat => (
                      <TableRow key={boat.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                              {boat.imageUrl ? (
                                <img src={boat.imageUrl} alt={boat.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon name="Image" size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <div>{boat.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {boat.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {boat.categories.map(category => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{boat.price} ₽/день</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" className="text-yellow-500" size={16} />
                            <span>{boat.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditBoat(boat)}
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setSelectedBoat(boat);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Icon name="Trash" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Заглушки для других вкладок */}
        <TabsContent value="active">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p>Список активных лодок будет здесь</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p>Список черновиков лодок будет здесь</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать лодку</DialogTitle>
          </DialogHeader>
          <BoatForm mode="edit" />
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Удалить лодку</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить лодку "{selectedBoat?.name}"?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Это действие нельзя отменить. Лодка будет удалена из системы вместе с историей бронирований.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoat}>
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
