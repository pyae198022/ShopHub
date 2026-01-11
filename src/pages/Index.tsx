import { useState, useMemo, useEffect } from "react";
import Hero from "@/components/Hero";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ShopGrid from "@/components/ShopGrid";
import OnboardingModal, { TastePreference } from "@/components/OnboardingModal";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { shops as fallbackShops, filterShops } from "@/data/shops";
import { Shop } from "@/components/ShopCard";

const ONBOARDING_KEY = "localflavors_onboarded";
const PREFERENCES_KEY = "localflavors_preferences";
const LOCATION_KEY = "localflavors_location";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("Detecting location...");
  const [tastePreferences, setTastePreferences] = useState<TastePreference[]>(["all"]);
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  // Fetch real places from Google Places API
  const { places: apiPlaces, isLoading, error } = useNearbyPlaces(
    coordinates.lat,
    coordinates.lng
  );

  // Check if user has completed onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    const savedLocation = localStorage.getItem(LOCATION_KEY);

    if (!hasOnboarded) {
      setShowOnboarding(true);
    } else {
      if (savedPreferences) {
        const { tastes, location } = JSON.parse(savedPreferences);
        setTastePreferences(tastes);
        setUserLocation(location || "Your Area");
      }
      if (savedLocation) {
        const { lat, lng } = JSON.parse(savedLocation);
        setCoordinates({ lat, lng });
      }
    }
  }, []);

  const handleOnboardingComplete = (
    tastes: TastePreference[],
    address: string | null,
    lat?: number,
    lng?: number
  ) => {
    setTastePreferences(tastes);
    setUserLocation(address || "Your Area");
    setShowOnboarding(false);

    if (lat && lng) {
      setCoordinates({ lat, lng });
      localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lng }));
    }

    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ tastes, location: address }));
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setUserLocation("Your Area");
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ tastes: ["all"], location: null }));
  };

  // Use API places if available, otherwise use fallback
  const shopsToDisplay = apiPlaces.length > 0 ? apiPlaces : fallbackShops;

  const filteredShops = useMemo(() => {
    let filtered: Shop[] = shopsToDisplay;

    // Filter by category
    if (activeCategory !== "all") {
      const categoryMap: Record<Category, string> = {
        all: "",
        "street-food": "Street Food",
        "local-dishes": "Local Dishes",
        snacks: "Snacks",
      };
      filtered = filtered.filter((shop) => shop.category === categoryMap[activeCategory]);
    }

    // Filter by taste preferences
    if (!tastePreferences.includes("all")) {
      filtered = filtered.filter((shop) =>
        shop.tasteTags.some((tag) => tastePreferences.includes(tag as TastePreference))
      );
    }

    // Filter by search query
    if (submittedQuery.trim()) {
      const query = submittedQuery.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.speciality.toLowerCase().includes(query) ||
          shop.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, submittedQuery, tastePreferences, shopsToDisplay]);

  const handleSearch = (query: string) => {
    setSubmittedQuery(query);
  };

  const getTitle = () => {
    if (isLoading) {
      return "Finding places near you...";
    }
    if (error) {
      return "Popular Near You";
    }
    if (submittedQuery) {
      return `Results for "${submittedQuery}"`;
    }
    if (activeCategory === "all") {
      return apiPlaces.length > 0 ? "Real Places Near You" : "Popular Near You";
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
      
      {isLoading && (
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span>Searching for restaurants near you...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="px-4 py-2 max-w-6xl mx-auto">
          <p className="text-sm text-muted-foreground">
            Using demo data. Enable location for real results.
          </p>
        </div>
      )}
      
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
