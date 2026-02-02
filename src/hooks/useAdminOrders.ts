import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingAddress: ShippingAddress | null;
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

function parseShippingAddress(json: Json | null): ShippingAddress | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  const obj = json as Record<string, unknown>;
  return {
    firstName: String(obj.firstName || ''),
    lastName: String(obj.lastName || ''),
    address: String(obj.address || ''),
    city: String(obj.city || ''),
    state: String(obj.state || ''),
    zipCode: String(obj.zipCode || ''),
    country: String(obj.country || ''),
  };
}

export function useAdminOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime updates for all orders (admin view)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Admin order update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const query = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async (): Promise<Order[]> => {
      // First check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Fetch all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!orders) return [];

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            id: order.id,
            userId: order.user_id,
            status: order.status,
            total: Number(order.total),
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            shippingAddress: parseShippingAddress(order.shipping_address),
            trackingNumber: order.tracking_number,
            carrier: order.carrier,
            estimatedDelivery: order.estimated_delivery,
            shippedAt: order.shipped_at,
            deliveredAt: order.delivered_at,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            items: (items || []).map((item) => ({
              id: item.id,
              productId: item.product_id,
              productName: item.product_name,
              productImage: item.product_image,
              quantity: item.quantity,
              price: Number(item.price),
            })),
          };
        })
      );

      return ordersWithItems;
    },
    enabled: !!user,
  });

  return query;
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      trackingNumber,
      carrier,
      estimatedDelivery,
    }: {
      orderId: string;
      status?: string;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: string;
    }) => {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (status) {
        updates.status = status;
        if (status === 'shipped') {
          updates.shipped_at = new Date().toISOString();
        } else if (status === 'delivered') {
          updates.delivered_at = new Date().toISOString();
        }
      }
      if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
      if (carrier !== undefined) updates.carrier = carrier;
      if (estimatedDelivery !== undefined) updates.estimated_delivery = estimatedDelivery;

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      return { orderId, status, trackingNumber, carrier, estimatedDelivery };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'Order Updated',
        description: 'The order has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      return !!data;
    },
    enabled: !!user,
  });
}
