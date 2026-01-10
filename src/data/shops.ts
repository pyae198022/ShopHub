import streetFood1 from "@/assets/street-food-1.jpg";
import streetFood2 from "@/assets/street-food-2.jpg";
import localFood1 from "@/assets/local-food-1.jpg";
import localFood2 from "@/assets/local-food-2.jpg";
import snacks1 from "@/assets/snacks-1.jpg";
import snacks2 from "@/assets/snacks-2.jpg";

import { Shop, TasteTag } from "@/components/ShopCard";
import { Category } from "@/components/CategoryFilter";
import { TastePreference } from "@/components/OnboardingModal";

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
    tasteTags: ["savory", "spicy"],
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
    tasteTags: ["sweet"],
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
    tasteTags: ["savory"],
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
    tasteTags: ["savory", "spicy"],
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
    tasteTags: ["savory"],
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
    tasteTags: ["sweet"],
  },
  {
    id: "7",
    name: "Tamarind Kitchen",
    image: streetFood1,
    rating: 4.7,
    reviewCount: 203,
    distance: "0.9 km",
    category: "Local Dishes",
    openNow: true,
    priceRange: "$$",
    speciality: "Tangy Thai soups & pad thai",
    tasteTags: ["sour", "spicy"],
  },
  {
    id: "8",
    name: "Pickle Paradise",
    image: snacks2,
    rating: 4.4,
    reviewCount: 89,
    distance: "1.5 km",
    category: "Snacks",
    openNow: true,
    priceRange: "$",
    speciality: "Fermented vegetables & pickled treats",
    tasteTags: ["sour", "savory"],
  },
];

export const filterShops = (
  category: Category,
  searchQuery: string,
  tastePreferences: TastePreference[] = ["all"]
): Shop[] => {
  let filtered = shops;

  // Filter by category
  if (category !== "all") {
    const categoryMap: Record<Category, string> = {
      all: "",
      "street-food": "Street Food",
      "local-dishes": "Local Dishes",
      snacks: "Snacks",
    };
    filtered = filtered.filter((shop) => shop.category === categoryMap[category]);
  }

  // Filter by taste preferences
  if (!tastePreferences.includes("all")) {
    filtered = filtered.filter((shop) =>
      shop.tasteTags.some((tag) => tastePreferences.includes(tag as TastePreference))
    );
  }

  // Filter by search query
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
