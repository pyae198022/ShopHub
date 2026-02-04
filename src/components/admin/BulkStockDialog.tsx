import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface BulkStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (stock: number) => void;
  isPending: boolean;
}

export function BulkStockDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isPending,
}: BulkStockDialogProps) {
  const [stock, setStock] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockValue = parseInt(stock, 10);
    if (!isNaN(stockValue) && stockValue >= 0) {
      onConfirm(stockValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>
            Set the stock quantity for {selectedCount} selected product(s).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-stock">New Stock Quantity</Label>
              <Input
                id="bulk-stock"
                type="number"
                min="0"
                placeholder="Enter stock quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !stock}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
