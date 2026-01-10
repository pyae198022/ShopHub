import { Utensils, Store, Cookie, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export type Category = "all" | "street-food" | "local-dishes" | "snacks";

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories = [
  { id: "all" as Category, label: "All", icon: Sparkles },
  { id: "street-food" as Category, label: "Street Food", icon: Utensils },
  { id: "local-dishes" as Category, label: "Local Dishes", icon: Store },
  { id: "snacks" as Category, label: "Snacks", icon: Cookie },
];

const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <section className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "categoryActive" : "category"}
                size="pill"
                onClick={() => onCategoryChange(category.id)}
                className="animate-fade-in gap-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
