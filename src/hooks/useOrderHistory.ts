import { useQuery } from '@tanstack/react-query';
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

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping_address: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  billing_address: Record<string, unknown> | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export function useOrderHistory() {
  const { user } = useAuth();

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
