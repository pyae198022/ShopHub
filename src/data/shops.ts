import streetFood1 from "@/assets/street-food-1.jpg";
import streetFood2 from "@/assets/street-food-2.jpg";
import localFood1 from "@/assets/local-food-1.jpg";
import localFood2 from "@/assets/local-food-2.jpg";
import snacks1 from "@/assets/snacks-1.jpg";
import snacks2 from "@/assets/snacks-2.jpg";

import { Shop } from "@/components/ShopCard";
import { Category } from "@/components/CategoryFilter";

export const shops: Shop[] = [
  {
    id: "1",
    name: "Golden Wok Noodles",
    image: streetFood1,
    rating: 4.8,
    reviewCount: 324,
    distance: "0.3 km",
    category: "Street Food",
    openNow: true,
    priceRange: "$",
    speciality: "Famous for hand-pulled noodles & stir-fry",
  },
  {
    id: "2",
    name: "Mama's Bakery",
    image: localFood1,
    rating: 4.9,
    reviewCount: 512,
    distance: "0.5 km",
    category: "Local Dishes",
    openNow: true,
    priceRange: "$$",
    speciality: "Artisan croissants & fresh pastries daily",
  },
  {
    id: "3",
    name: "Dim Sum Palace",
    image: snacks1,
    rating: 4.7,
    reviewCount: 289,
    distance: "0.8 km",
    category: "Snacks",
    openNow: true,
    priceRange: "$$",
    speciality: "Traditional dumplings & spring rolls",
  },
  {
    id: "4",
    name: "Satay Street Corner",
    image: streetFood2,
    rating: 4.6,
    reviewCount: 198,
    distance: "1.2 km",
    category: "Street Food",
    openNow: false,
    priceRange: "$",
    speciality: "Grilled skewers with peanut sauce",
  },
  {
    id: "5",
    name: "Ramen House",
    image: localFood2,
    rating: 4.8,
    reviewCount: 445,
    distance: "0.6 km",
    category: "Local Dishes",
    openNow: true,
    priceRange: "$$",
    speciality: "Rich tonkotsu broth & soft-boiled eggs",
  },
  {
    id: "6",
    name: "Sweet Mochi Corner",
    image: snacks2,
    rating: 4.5,
    reviewCount: 156,
    distance: "1.0 km",
    category: "Snacks",
    openNow: true,
    priceRange: "$",
    speciality: "Handmade mochi ice cream & Japanese sweets",
  },
];

export const filterShops = (category: Category, searchQuery: string): Shop[] => {
  let filtered = shops;

  if (category !== "all") {
    const categoryMap: Record<Category, string> = {
      all: "",
      "street-food": "Street Food",
      "local-dishes": "Local Dishes",
      snacks: "Snacks",
    };
    filtered = filtered.filter((shop) => shop.category === categoryMap[category]);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query) ||
        shop.speciality.toLowerCase().includes(query) ||
        shop.category.toLowerCase().includes(query)
    );
  }

  return filtered;
};
