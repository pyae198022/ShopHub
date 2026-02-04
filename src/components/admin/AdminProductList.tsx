import { useState } from 'react';
import {
  useAdminProducts,
  useDeleteProduct,
  useBulkDeleteProducts,
  useBulkUpdateStock,
  Product,
} from '@/hooks/useAdminProducts';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { BulkStockDialog } from './BulkStockDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2, Package, Pencil, Search, Trash2 } from 'lucide-react';

export function AdminProductList() {
  const { data: products, isLoading, error } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const bulkDeleteProducts = useBulkDeleteProducts();
  const bulkUpdateStock = useBulkUpdateStock();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkStockDialog, setShowBulkStockDialog] = useState(false);

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected =
    filteredProducts &&
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else if (filteredProducts) {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    bulkDeleteProducts.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  };

  const handleBulkStockUpdate = (stock: number) => {
    bulkUpdateStock.mutate(
      { productIds: Array.from(selectedIds), stock },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setShowBulkStockDialog(false);
        },
      }
    );
  };

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

      {/* Stats & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all products"
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{filteredProducts?.length || 0} products</span>
            {someSelected && (
              <Badge variant="secondary">{selectedIds.size} selected</Badge>
            )}
          </div>
        </div>

        {/* Bulk Action Buttons */}
        {someSelected && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkStockDialog(true)}
              disabled={bulkUpdateStock.isPending}
            >
              {bulkUpdateStock.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Stock
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={bulkDeleteProducts.isPending}
                >
                  {bulkDeleteProducts.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} selected product(s)?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
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
              selected={selectedIds.has(product.id)}
              onSelect={() => toggleSelect(product.id)}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => deleteProduct.mutate(product.id)}
              isDeleting={deleteProduct.isPending}
            />
          ))}
        </div>
      )}

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      />

      {/* Bulk Stock Dialog */}
      <BulkStockDialog
        open={showBulkStockDialog}
        onOpenChange={setShowBulkStockDialog}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkStockUpdate}
        isPending={bulkUpdateStock.isPending}
      />
    </div>
  );
}

function ProductCard({
  product,
  selected,
  onSelect,
  onEdit,
  onDelete,
  isDeleting,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className={selected ? 'ring-2 ring-primary' : ''}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              aria-label={`Select ${product.name}`}
            />
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-md"
            />
          </div>
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
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
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
