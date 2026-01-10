import { MapPin, Search } from "lucide-react";
import { Button } from "./ui/button";

interface HeroProps {
  location: string;
  onSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Hero = ({ location, onSearch, searchQuery, setSearchQuery }: HeroProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="bg-gradient-hero pt-8 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Location Badge */}
        <div className="inline-flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-card mb-6 animate-fade-in">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{location}</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Discover <span className="text-gradient-warm">Local Flavors</span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Find the best street foods, local dishes, and hidden snack gems near you
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for foods or shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-32 rounded-2xl bg-card border border-border shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              variant="warm"
              size="pill"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;
