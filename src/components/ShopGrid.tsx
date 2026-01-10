import ShopCard, { Shop } from "./ShopCard";

interface ShopGridProps {
  shops: Shop[];
  title: string;
}

const ShopGrid = ({ shops, title }: ShopGridProps) => {
  if (shops.length === 0) {
    return (
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-lg">No shops found. Try a different search or category.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopGrid;
