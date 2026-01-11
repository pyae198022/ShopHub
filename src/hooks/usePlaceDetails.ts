import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlacePhoto {
  url: string;
  attributions: string[];
}

export interface PlaceReview {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  internationalPhone: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number;
  totalRatings: number;
  priceLevel: number | null;
  photos: PlacePhoto[];
  reviews: PlaceReview[];
  location: { lat: number; lng: number } | null;
  types: string[];
  businessStatus: string;
  openingHours: {
    isOpen: boolean;
    weekdayText: string[];
  } | null;
}

interface UsePlaceDetailsResult {
  place: PlaceDetails | null;
  isLoading: boolean;
  error: string | null;
}

export const usePlaceDetails = (placeId: string | null): UsePlaceDetailsResult => {
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!placeId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("place-details", {
          body: { placeId },
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setPlace(data.place);
      } catch (err) {
        console.error("Error fetching place details:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch place details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [placeId]);

  return { place, isLoading, error };
};
