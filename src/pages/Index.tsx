import { useState, useMemo, useEffect } from "react";
import Hero from "@/components/Hero";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ShopGrid from "@/components/ShopGrid";
import OnboardingModal, { TastePreference } from "@/components/OnboardingModal";
import { filterShops } from "@/data/shops";

const ONBOARDING_KEY = "localflavors_onboarded";
const PREFERENCES_KEY = "localflavors_preferences";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("Detecting location...");
  const [tastePreferences, setTastePreferences] = useState<TastePreference[]>(["all"]);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    
    if (!hasOnboarded) {
      setShowOnboarding(true);
    } else if (savedPreferences) {
      const { tastes, location } = JSON.parse(savedPreferences);
      setTastePreferences(tastes);
      setUserLocation(location || "Your Area");
    }
  }, []);

  const handleOnboardingComplete = (tastes: TastePreference[], address: string | null) => {
    setTastePreferences(tastes);
    setUserLocation(address || "Your Area");
    setShowOnboarding(false);
    
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ tastes, location: address }));
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setUserLocation("Your Area");
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ tastes: ["all"], location: null }));
  };

  const filteredShops = useMemo(() => {
    return filterShops(activeCategory, submittedQuery, tastePreferences);
  }, [activeCategory, submittedQuery, tastePreferences]);

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
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      
      <Hero
        location={userLocation}
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
