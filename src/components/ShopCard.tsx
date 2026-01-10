import { Star, MapPin, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

export interface Shop {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  category: string;
  openNow: boolean;
  priceRange: string;
  speciality: string;
}

interface ShopCardProps {
  shop: Shop;
  index: number;
}

const ShopCard = ({ shop, index }: ShopCardProps) => {
  return (
    <article
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-card/90 backdrop-blur-sm text-foreground border-0 font-medium">
            {shop.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            className={`border-0 font-medium ${
              shop.openNow
                ? "bg-warm-olive/90 text-primary-foreground"
                : "bg-muted/90 text-muted-foreground"
            }`}
          >
            {shop.openNow ? "Open" : "Closed"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {shop.name}
          </h3>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {shop.priceRange}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {shop.speciality}
        </p>

        <div className="flex items-center gap-4 text-sm">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warm-golden text-warm-golden" />
            <span className="font-medium text-foreground">{shop.rating}</span>
            <span className="text-muted-foreground">({shop.reviewCount})</span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{shop.distance}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ShopCard;
