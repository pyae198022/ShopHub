import { useState } from 'react';
import { useAdminProducts, useDeleteProduct, Product } from '@/hooks/useAdminProducts';
import { AddProductDialog } from './AddProductDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Package, Search, Trash2 } from 'lucide-react';

export function AdminProductList() {
  const { data: products, isLoading, error } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load products: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddProductDialog />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="h-4 w-4" />
        <span>{filteredProducts?.length || 0} products</span>
      </div>

      {/* Product Grid */}
      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No products found</p>
          <p className="text-sm">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={() => deleteProduct.mutate(product.id)}
              isDeleting={deleteProduct.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onDelete,
  isDeleting,
}: {
  product: Product;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{product.category}</Badge>
              <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
