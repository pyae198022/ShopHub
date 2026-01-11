import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceDetails } from "@/hooks/usePlaceDetails";

const priceLevelToSymbol = (level: number | null): string => {
  if (!level) return "$";
  return "$".repeat(level);
};

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { place, isLoading, error } = usePlaceDetails(id || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-64 bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || "Restaurant not found"}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96">
        {place.photos.length > 0 ? (
          <img
            src={place.photos[0].url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-warm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              {place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-warm-golden text-warm-golden" />
                <span className="font-semibold">{place.rating?.toFixed(1) || "N/A"}</span>
                <span className="text-white/70">({place.totalRatings} reviews)</span>
              </div>
              <span className="text-white/50">•</span>
              <span>{priceLevelToSymbol(place.priceLevel)}</span>
              {place.openingHours && (
                <>
                  <span className="text-white/50">•</span>
                  <Badge className={place.openingHours.isOpen ? "bg-warm-olive" : "bg-muted"}>
                    {place.openingHours.isOpen ? "Open Now" : "Closed"}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {place.mapsUrl && (
            <Button asChild variant="warm" className="flex-1 min-w-[140px]">
              <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </a>
            </Button>
          )}
          {place.phone && (
            <Button asChild variant="outline" className="flex-1 min-w-[140px]">
              <a href={`tel:${place.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
            </Button>
          )}
          {place.website && (
            <Button asChild variant="outline" className="flex-1 min-w-[140px]">
              <a href={place.website} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </a>
            </Button>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Address */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-medium text-foreground">{place.address}</p>
              </div>
            </div>
          </div>

          {/* Hours */}
          {place.openingHours && (
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Hours</p>
                  <div className="space-y-1">
                    {place.openingHours.weekdayText?.slice(0, 3).map((day, i) => (
                      <p key={i} className="text-sm text-foreground">{day}</p>
                    ))}
                    {place.openingHours.weekdayText && place.openingHours.weekdayText.length > 3 && (
                      <details className="text-sm">
                        <summary className="text-primary cursor-pointer">Show all hours</summary>
                        {place.openingHours.weekdayText.slice(3).map((day, i) => (
                          <p key={i} className="text-foreground mt-1">{day}</p>
                        ))}
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        {place.photos.length > 1 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {place.photos.slice(1).map((photo, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden">
                  <img
                    src={photo.url}
                    alt={`${place.name} photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {place.reviews.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Reviews</h2>
            <div className="space-y-4">
              {place.reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {review.authorPhoto ? (
                      <img
                        src={review.authorPhoto}
                        alt={review.authorName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {review.authorName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{review.authorName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-warm-golden text-warm-golden"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.relativeTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open in Google Maps */}
        {place.mapsUrl && (
          <div className="pt-4 border-t border-border">
            <a
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              View on Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
