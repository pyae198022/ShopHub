import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Loader2 } from 'lucide-react';
import { ShopHeader } from '@/components/ecommerce/ShopHeader';
import { CategoryFilter } from '@/components/ecommerce/CategoryFilter';
import { ProductCard } from '@/components/ecommerce/ProductCard';
import { ProductListItem } from '@/components/ecommerce/ProductListItem';
import { AIRecommendations } from '@/components/ecommerce/AIRecommendations';
import { categories } from '@/data/sampleProducts';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRODUCTS_PER_PAGE_OPTIONS = [8, 16, 24, 48];
const VIEW_MODE_KEY = 'shop-view-mode';

type ViewMode = 'grid' | 'list';

const getStoredViewMode = (): ViewMode => {
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === 'list' ? 'list' : 'grid';
};

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode);

  // Fetch products from database
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((p): Product => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        image: p.image,
        category: p.category,
        stock: p.stock,
        rating: p.rating ? Number(p.rating) : undefined,
        reviewCount: p.review_count ?? undefined,
        tags: p.tags ?? undefined,
      }));
    },
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, products]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, productsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  const handleProductsPerPageChange = (value: string) => {
    setProductsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">
            Discover our curated collection of premium products
          </p>
        </div>

        <AIRecommendations />

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products found. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * productsPerPage + 1}-
                {Math.min(currentPage * productsPerPage, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={productsPerPage.toString()} onValueChange={handleProductsPerPageChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <span className="px-3 py-2">...</span>
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
}