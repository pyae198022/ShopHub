import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderNotificationRequest {
  orderId: string;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

const getEmailContent = (
  status: string,
  orderId: string,
  trackingNumber?: string,
  carrier?: string,
  estimatedDelivery?: string
) => {
  const orderIdShort = orderId.slice(0, 8).toUpperCase();

  switch (status) {
    case "confirmed":
      return {
        subject: `Order Confirmed - #${orderIdShort}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">✓ Order Confirmed!</h1>
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Order ID:</strong> #${orderIdShort}</p>
            </div>
            <p>We'll send you another email when your order ships.</p>
            <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with us!</p>
          </div>
        `,
      };
    case "processing":
      return {
        subject: `Order Processing - #${orderIdShort}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">📦 Order Being Prepared</h1>
            <p>Great news! Your order is now being prepared for shipment.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Order ID:</strong> #${orderIdShort}</p>
            </div>
            <p>We'll notify you as soon as it ships!</p>
            <p style="color: #6b7280; font-size: 14px;">Thank you for your patience!</p>
          </div>
        `,
      };
    case "shipped":
      return {
        subject: `Order Shipped - #${orderIdShort}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">🚚 Your Order Has Shipped!</h1>
            <p>Your order is on its way to you!</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 8px 0;"><strong>Order ID:</strong> #${orderIdShort}</p>
              ${carrier ? `<p style="margin: 8px 0;"><strong>Carrier:</strong> ${carrier}</p>` : ""}
              ${trackingNumber ? `<p style="margin: 8px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
              ${estimatedDelivery ? `<p style="margin: 8px 0;"><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</p>` : ""}
            </div>
            <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with us!</p>
          </div>
        `,
      };
    case "delivered":
      return {
        subject: `Order Delivered - #${orderIdShort}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">🎉 Your Order Has Been Delivered!</h1>
            <p>Your order has been delivered successfully.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Order ID:</strong> #${orderIdShort}</p>
            </div>
            <p>We hope you love your purchase! If you have any questions, please don't hesitate to reach out.</p>
            <p style="color: #6b7280; font-size: 14px;">Thank you for shopping with us!</p>
          </div>
        `,
      };
    default:
      return {
        subject: `Order Update - #${orderIdShort}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Order Update</h1>
            <p>Your order #${orderIdShort} has been updated.</p>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, status, trackingNumber, carrier, estimatedDelivery }: OrderNotificationRequest = await req.json();

    console.log(`Processing notification for order ${orderId} with status ${status}`);

    // Validate required fields
    if (!orderId || !status) {
      throw new Error("Missing required fields: orderId and status are required");
    }

    // Fetch order details to get user email
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    // Get user email from shipping address or auth
    const shippingAddress = order.shipping_address as { email?: string } | null;
    let userEmail = shippingAddress?.email;

    if (!userEmail && order.user_id) {
      // Try to get email from auth user
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
      userEmail = authUser?.user?.email;
    }

    if (!userEmail) {
      console.error("No email found for order");
      throw new Error("No email address found for this order");
    }

    console.log(`Sending ${status} email to ${userEmail}`);

    const { subject, html } = getEmailContent(status, orderId, trackingNumber, carrier, estimatedDelivery);

    const emailResponse = await resend.emails.send({
      from: "Orders <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-order-notification function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
