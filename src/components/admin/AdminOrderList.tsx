import { useState } from 'react';
import { useAdminOrders, Order } from '@/hooks/useAdminOrders';
import { AdminOrderCard } from './AdminOrderCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Search, Download } from 'lucide-react';
import { format } from 'date-fns';

function exportOrdersToCSV(orders: Order[]) {
  const headers = [
    'Order ID',
    'Status',
    'Customer Name',
    'Email',
    'Total',
    'Subtotal',
    'Tax',
    'Tracking Number',
    'Carrier',
    'Created At',
    'Shipped At',
    'Delivered At',
  ];

  const rows = orders.map((order) => [
    order.id,
    order.status,
    order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : '',
    order.userEmail || '',
    order.total.toFixed(2),
    order.subtotal.toFixed(2),
    order.tax.toFixed(2),
    order.trackingNumber || '',
    order.carrier || '',
    format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    order.shippedAt ? format(new Date(order.shippedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    order.deliveredAt ? format(new Date(order.deliveredAt), 'yyyy-MM-dd HH:mm:ss') : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `orders-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function AdminOrderList() {
  const { data: orders, isLoading, error } = useAdminOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, tracking number, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => filteredOrders && exportOrdersToCSV(filteredOrders)}
          disabled={!filteredOrders || filteredOrders.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => {
          const count = orders?.filter((o) => o.status === status).length || 0;
          return (
            <div
              key={status}
              className="bg-card rounded-lg p-4 border border-border shadow-card"
            >
              <p className="text-sm text-muted-foreground capitalize">{status}</p>
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Order List */}
      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  );
}
