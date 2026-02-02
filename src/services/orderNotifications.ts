import { supabase } from '@/integrations/supabase/client';

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered';

interface SendOrderNotificationParams {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export async function sendOrderNotification({
  orderId,
  status,
  trackingNumber,
  carrier,
  estimatedDelivery,
}: SendOrderNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderId,
        status,
        trackingNumber,
        carrier,
        estimatedDelivery,
      },
    });

    if (error) {
      console.error('Failed to send order notification:', error);
      return { success: false, error: error.message };
    }

    console.log(`Order ${status} notification sent successfully for order ${orderId}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending order notification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
