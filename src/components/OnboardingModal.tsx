import { useState } from "react";
import { MapPin, Utensils, Loader2, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { useGeolocation } from "@/hooks/useGeolocation";

export type TastePreference = "spicy" | "savory" | "sweet" | "sour" | "all";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (preferences: TastePreference[], address: string | null, lat?: number, lng?: number) => void;
  onSkip: () => void;
}

const tasteOptions: { id: TastePreference; label: string; emoji: string; description: string }[] = [
  { id: "spicy", label: "Spicy", emoji: "🌶️", description: "Hot & fiery flavors" },
  { id: "savory", label: "Savory", emoji: "🍖", description: "Rich & umami tastes" },
  { id: "sweet", label: "Sweet", emoji: "🍰", description: "Desserts & treats" },
  { id: "sour", label: "Sour", emoji: "🍋", description: "Tangy & refreshing" },
  { id: "all", label: "All Flavors", emoji: "🍽️", description: "I love everything!" },
];

const OnboardingModal = ({ open, onComplete, onSkip }: OnboardingModalProps) => {
  const [step, setStep] = useState<"location" | "taste">("location");
  const [selectedTastes, setSelectedTastes] = useState<TastePreference[]>([]);
  const { location, requestLocation } = useGeolocation();

  const handleLocationRequest = async () => {
    await requestLocation();
  };

  const handleContinueToTaste = () => {
    setStep("taste");
  };

  const toggleTaste = (taste: TastePreference) => {
    if (taste === "all") {
      setSelectedTastes(["all"]);
      return;
    }
    
    setSelectedTastes((prev) => {
      const filtered = prev.filter((t): t is TastePreference => t !== "all");
      if (filtered.includes(taste)) {
        return filtered.filter((t) => t !== taste);
      }
      return [...filtered, taste];
    });
  };

  const handleComplete = () => {
    const tastes: TastePreference[] = selectedTastes.length > 0 ? selectedTastes : ["all"];
    onComplete(tastes, location.address, location.latitude ?? undefined, location.longitude ?? undefined);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none">
        <DialogTitle className="sr-only">Welcome to Local Flavors</DialogTitle>
        
        {/* Close/Skip Button */}
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 bg-muted/80 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {step === "location" ? (
          <div className="p-6 pt-8">
            {/* Location Step */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-warm mx-auto mb-6 flex items-center justify-center animate-pulse-soft">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Find Food Near You
              </h2>
              <p className="text-muted-foreground">
                Allow location access to discover the best local eats around you
              </p>
            </div>

            <div className="space-y-3">
              {!location.address && !location.error ? (
                <Button
                  onClick={handleLocationRequest}
                  variant="warm"
                  className="w-full h-12"
                  disabled={location.loading}
                >
                  {location.loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 mr-2" />
                      Enable Location
                    </>
                  )}
                </Button>
              ) : location.address ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Your location</p>
                      <p className="font-medium text-foreground truncate">{location.address}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleContinueToTaste}
                    variant="warm"
                    className="w-full h-12"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-center">
                    <p className="text-sm text-destructive">{location.error}</p>
                  </div>
                  <Button
                    onClick={handleContinueToTaste}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Continue Without Location
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 pt-8">
            {/* Taste Preference Step */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-warm mx-auto mb-6 flex items-center justify-center">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What's Your Flavor?
              </h2>
              <p className="text-muted-foreground">
                Select your taste preferences to get personalized recommendations
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {tasteOptions.map((taste) => {
                const isSelected = selectedTastes.includes(taste.id);
                return (
                  <button
                    key={taste.id}
                    onClick={() => toggleTaste(taste.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-warm"
                        : "border-border bg-card hover:border-primary/50"
                    } ${taste.id === "all" ? "col-span-2" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{taste.emoji}</span>
                      <div>
                        <p className="font-semibold text-foreground">{taste.label}</p>
                        <p className="text-xs text-muted-foreground">{taste.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleComplete}
              variant="warm"
              className="w-full h-12"
            >
              Discover Food
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
