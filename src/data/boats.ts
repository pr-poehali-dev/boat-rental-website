
export interface BoatType {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  year: number;
  length: number;
  capacity: number;
  features: string[];
  categories: string[];
  isNew?: boolean;
  specifications: {
    engine: string;
    power: string;
    maxSpeed: string;
    fuel: string;
  };
}

export const boats: BoatType[] = [
  {
    id: 1,
    name: "Yamaha 190 FSH Sport",
    description: "Идеальная лодка для рыбалки и семейного отдыха, сочетающая комфорт и функциональность.",
    price: 5000,
    images: [
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1575362247640-5981fca3d0d3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1588533588400-9ee75bdf82ce?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    year: 2022,
    length: 5.8,
    capacity: 6,
    features: ["Эхолот", "GPS-навигатор", "Рыболовные держатели", "Холодильник", "Аудиосистема"],
    categories: ["fishing", "family"],
    isNew: true,
    specifications: {
      engine: "Yamaha Marine",
      power: "115 л.с.",
      maxSpeed: "68 км/ч",
      fuel: "95 л"
    }
  },
  {
    id: 2,
    name: "Bayliner VR6",
    description: "Комфортабельный катер для семейного отдыха и водных развлечений с просторной палубой.",
    price: 7500,
    images: [
      "https://images.unsplash.com/photo-1542902093-d55926049754?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1609764441108-25e52be9ab53?auto=format&fit=crop&q=80&w=600", 
      "https://images.unsplash.com/photo-1575362247640-5981fca3d0d3?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    year: 2021,
    length: 6.5,
    capacity: 8,
    features: ["Душ", "Лежаки для загара", "Аудиосистема", "Холодильник", "Стол"],
    categories: ["family", "sport"],
    specifications: {
      engine: "MerCruiser",
      power: "230 л.с.",
      maxSpeed: "75 км/ч",
      fuel: "132 л"
    }
  },
  {
    id: 3,
    name: "Sea Ray 250 SLX",
    description: "Премиальный катер с изысканным дизайном и высочайшим уровнем комфорта для незабываемого отдыха.",
    price: 9000,
    images: [
      "https://images.unsplash.com/photo-1554254648-2d58a1bc3fd5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1622022526774-27add6fc6a7d?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    year: 2023,
    length: 7.6,
    capacity: 10,
    features: ["Кондиционер", "Премиальная аудиосистема", "Бар", "Душ", "Туалет", "Каюта"],
    categories: ["luxury", "family"],
    isNew: true,
    specifications: {
      engine: "Mercury",
      power: "350 л.с.",
      maxSpeed: "82 км/ч",
      fuel: "180 л"
    }
  },
  {
    id: 4,
    name: "Boston Whaler 170 Montauk",
    description: "Надежная лодка для рыбалки с отличной устойчивостью и множеством рыболовных функций.",
    price: 4500,
    images: [
      "https://images.unsplash.com/photo-1564667009085-e5a1c2155df7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1546500840-ae38253aba9b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1575223970966-76ae61ee7838?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.5,
    year: 2020,
    length: 5.2,
    capacity: 4,
    features: ["Живорыбный садок", "Держатели для удочек", "Навигационная система", "Эхолот"],
    categories: ["fishing"],
    specifications: {
      engine: "Mercury",
      power: "90 л.с.",
      maxSpeed: "60 км/ч",
      fuel: "75 л"
    }
  },
  {
    id: 5,
    name: "MasterCraft X24",
    description: "Спортивный катер для вейкбординга и водных лыж с мощным двигателем и специальным оборудованием.",
    price: 8500,
    images: [
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1566526974056-c9e9c8f47405?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1577715970163-d449d3689e07?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.7,
    year: 2022,
    length: 7.3,
    capacity: 6,
    features: ["Специальная вышка для вейкбординга", "Балластная система", "Спортивный руль", "Аудиосистема"],
    categories: ["sport", "luxury"],
    specifications: {
      engine: "Ilmor",
      power: "420 л.с.",
      maxSpeed: "85 км/ч",
      fuel: "155 л"
    }
  },
  {
    id: 6,
    name: "Starcraft SVX 171",
    description: "Компактная и доступная лодка для активного отдыха на воде и рыбалки.",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1627416124694-2f9128c64683?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.3,
    year: 2019,
    length: 5.2,
    capacity: 5,
    features: ["Держатели для удочек", "Аудиосистема", "Хранилище для снаряжения"],
    categories: ["fishing", "family"],
    specifications: {
      engine: "Yamaha",
      power: "75 л.с.",
      maxSpeed: "55 км/ч",
      fuel: "68 л"
    }
  }
];
