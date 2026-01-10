import { useState, useMemo } from "react";
import Hero from "@/components/Hero";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ShopGrid from "@/components/ShopGrid";
import { filterShops } from "@/data/shops";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Simulated current location
  const currentLocation = "Downtown, City Center";

  const filteredShops = useMemo(() => {
    return filterShops(activeCategory, submittedQuery);
  }, [activeCategory, submittedQuery]);

  const handleSearch = (query: string) => {
    setSubmittedQuery(query);
  };

  const getTitle = () => {
    if (submittedQuery) {
      return `Results for "${submittedQuery}"`;
    }
    if (activeCategory === "all") {
      return "Popular Near You";
    }
    const titles: Record<Category, string> = {
      all: "Popular Near You",
      "street-food": "Street Food Spots",
      "local-dishes": "Local Favorites",
      snacks: "Snack Havens",
    };
    return titles[activeCategory];
  };

  return (
    <main className="min-h-screen bg-background">
      <Hero
        location={currentLocation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ShopGrid shops={filteredShops} title={getTitle()} />
      
      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          Discover the best local food spots around you 🍜
        </p>
      </footer>
    </main>
  );
};

export default Index;
