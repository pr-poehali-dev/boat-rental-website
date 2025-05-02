
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";
import { BoatType } from "@/data/boats";
import { useCart } from "@/hooks/use-cart";

interface BoatCardProps {
  boat: BoatType;
  viewType: "grid" | "list";
}

const BoatCard = ({ boat, viewType }: BoatCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: boat.id,
      name: boat.name,
      price: boat.price,
      image: boat.images[0],
      days: 1
    });
  };

  if (viewType === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-[200px] md:h-auto relative">
            <img
              src={boat.images[0]}
              alt={boat.name}
              className="w-full h-full object-cover"
            />
            {boat.isNew && (
              <Badge className="absolute top-2 left-2 bg-blue-600">Новинка</Badge>
            )}
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">
                  <Link to={`/boat/${boat.id}`} className="hover:text-blue-600 transition-colors">
                    {boat.name}
                  </Link>
                </h3>
                <div className="flex items-center">
                  <Icon name="Star" size={16} className="text-yellow-500 mr-1" />
                  <span>{boat.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {boat.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {feature}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-600 mb-4">{boat.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Icon name="Users" size={16} className="mr-1" />
                  <span>до {boat.capacity} чел.</span>
                </div>
                <div className="flex items-center">
                  <Icon name="CalendarDays" size={16} className="mr-1" />
                  <span>{boat.year} г.</span>
                </div>
                <div className="flex items-center">
                  <Icon name="Ruler" size={16} className="mr-1" />
                  <span>{boat.length} м</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <span className="text-gray-500 text-sm">Стоимость аренды</span>
                <div className="text-xl font-bold text-blue-700">{boat.price} ₽/день</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  asChild
                >
                  <Link to={`/boat/${boat.id}`}>Подробнее</Link>
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  В корзину
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative h-48">
        <img
          src={boat.images[0]}
          alt={boat.name}
          className="w-full h-full object-cover"
        />
        {boat.isNew && (
          <Badge className="absolute top-2 left-2 bg-blue-600">Новинка</Badge>
        )}
      </div>
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              <Link to={`/boat/${boat.id}`} className="hover:text-blue-600 transition-colors">
                {boat.name}
              </Link>
            </h3>
            <div className="flex items-center">
              <Icon name="Star" size={14} className="text-yellow-500 mr-1" />
              <span className="text-sm">{boat.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{boat.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {boat.categories.map((category, index) => {
              const labels = {
                fishing: "Рыболовная",
                family: "Семейная",
                sport: "Спортивная",
                luxury: "Премиум"
              };
              const categoryLabel = labels[category as keyof typeof labels] || category;
              return (
                <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                  {categoryLabel}
                </Badge>
              );
            })}
          </div>
          <div className="flex gap-x-3 gap-y-1 flex-wrap text-xs text-gray-600 mb-2">
            <div className="flex items-center">
              <Icon name="Users" size={14} className="mr-1" />
              <span>{boat.capacity} чел.</span>
            </div>
            <div className="flex items-center">
              <Icon name="CalendarDays" size={14} className="mr-1" />
              <span>{boat.year} г.</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Цена аренды</span>
            <span className="font-bold text-blue-700">{boat.price} ₽/день</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link to={`/boat/${boat.id}`}>Детали</Link>
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleAddToCart}
            >
              В корзину
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoatCard;
