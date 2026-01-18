import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { browsingHistory, wishlistItems, allProducts } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating AI recommendations...");
    console.log("Browsing history:", browsingHistory?.length || 0, "items");
    console.log("Wishlist items:", wishlistItems?.length || 0, "items");
    console.log("All products:", allProducts?.length || 0, "items");

    // Build context for AI
    const historyContext = browsingHistory?.length > 0 
      ? `Recently viewed products: ${browsingHistory.map((p: any) => `${p.name} (${p.category}, $${p.price})`).join(", ")}`
      : "No browsing history available.";
    
    const wishlistContext = wishlistItems?.length > 0
      ? `Wishlist items: ${wishlistItems.map((p: any) => `${p.name} (${p.category}, $${p.price})`).join(", ")}`
      : "No wishlist items.";

    const productsContext = allProducts?.map((p: any) => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: $${p.price}, Description: ${p.description?.slice(0, 100) || 'N/A'}`
    ).join("\n") || "";

    const systemPrompt = `You are a helpful shopping assistant that recommends products based on user preferences and browsing history. 
    
Your task is to analyze the user's browsing history and wishlist to recommend products they might like.

Return ONLY a valid JSON array of product IDs (strings) for your top 4 recommendations. No explanation, just the JSON array.
Example: ["prod-1", "prod-2", "prod-3", "prod-4"]

Important rules:
- Only recommend products from the available products list
- Don't recommend products already in the user's wishlist
- Prioritize products similar to what they've viewed (same category, similar price range)
- If no browsing history, recommend popular/diverse products`;

    const userPrompt = `${historyContext}

${wishlistContext}

Available products:
${productsContext}

Based on this information, recommend 4 products the user would likely enjoy. Return only a JSON array of product IDs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "[]";
    
    console.log("AI response:", content);

    // Parse the JSON array from the response
    let recommendedIds: string[] = [];
    try {
      // Extract JSON array from response (handle potential markdown formatting)
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        recommendedIds = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to random recommendations if parsing fails
      recommendedIds = allProducts?.slice(0, 4).map((p: any) => p.id) || [];
    }

    console.log("Recommended product IDs:", recommendedIds);

    return new Response(JSON.stringify({ recommendations: recommendedIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
