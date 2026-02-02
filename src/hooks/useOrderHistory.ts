import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  created_at: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping_address: ShippingAddress | null;
  billing_address: Record<string, unknown> | null;
  payment_method: string | null;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export function useOrderHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime updates for orders
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order update received:', payload);
          // Invalidate and refetch orders when changes occur
          queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (orders || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            shipping_address: order.shipping_address as unknown as ShippingAddress | null,
            order_items: items || [],
          } as Order;
        })
      );

      return ordersWithItems;
    },
    enabled: !!user,
  });
}

export async function createOrder(
  userId: string,
  cart: {
    items: Array<{
      product: { id: string; name: string; image: string; price: number };
      quantity: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  },
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  paymentMethod: string
): Promise<string> {
  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: userId,
      status: 'confirmed',
      total: cart.total,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping_address: shippingAddress as unknown as Json,
      payment_method: paymentMethod,
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = cart.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order.id;
}
