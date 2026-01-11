import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shop, TasteTag } from "@/components/ShopCard";

interface PlaceResult {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  image: string;
  address: string;
  isOpen: boolean | null;
  priceLevel: number;
  totalRatings: number;
  location: {
    lat: number;
    lng: number;
  };
}

interface UseNearbyPlacesResult {
  places: Shop[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const priceLevelToRange = (level?: number): string => {
  if (!level) return "$";
  const ranges: Record<number, string> = {
    0: "$",
    1: "$",
    2: "$$",
    3: "$$$",
    4: "$$$$",
  };
  return ranges[level] || "$";
};

const categoryToTasteTags = (category: string): TasteTag[] => {
  const tagMap: Record<string, TasteTag[]> = {
    "street-food": ["savory", "spicy"],
    "local-food": ["savory"],
    snacks: ["sweet"],
  };
  return tagMap[category] || ["savory"];
};

const categoryToDisplayName = (category: string): string => {
  const nameMap: Record<string, string> = {
    "street-food": "Street Food",
    "local-food": "Local Dishes",
    snacks: "Snacks",
  };
  return nameMap[category] || "Local Dishes";
};

export const useNearbyPlaces = (
  latitude: number | null,
  longitude: number | null,
  radius: number = 1500
): UseNearbyPlacesResult => {
  const [places, setPlaces] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = async () => {
    if (!latitude || !longitude) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("nearby-places", {
        body: { latitude, longitude, radius },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const transformedPlaces: Shop[] = (data.places || []).map((place: PlaceResult) => ({
        id: place.id,
        name: place.name,
        image: place.image,
        rating: place.rating || 0,
        reviewCount: place.totalRatings || 0,
        distance: place.distance,
        category: categoryToDisplayName(place.category),
        openNow: place.isOpen ?? true,
        priceRange: priceLevelToRange(place.priceLevel),
        speciality: place.address || "Local favorite",
        tasteTags: categoryToTasteTags(place.category),
      }));

      setPlaces(transformedPlaces);
    } catch (err) {
      console.error("Error fetching places:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch places");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [latitude, longitude, radius]);

  return { places, isLoading, error, refetch: fetchPlaces };
};
