import { useState, useCallback } from "react";

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: false,
    error: null,
  });

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
      );
      const data = await response.json();
      
      const parts = [];
      if (data.address?.suburb) parts.push(data.address.suburb);
      else if (data.address?.neighbourhood) parts.push(data.address.neighbourhood);
      else if (data.address?.road) parts.push(data.address.road);
      
      if (data.address?.city) parts.push(data.address.city);
      else if (data.address?.town) parts.push(data.address.town);
      else if (data.address?.village) parts.push(data.address.village);
      
      return parts.length > 0 ? parts.join(", ") : "Your Location";
    } catch {
      return "Your Location";
    }
  };

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        
        setLocation({
          latitude,
          longitude,
          address,
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  return { location, requestLocation };
};
