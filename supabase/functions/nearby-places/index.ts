import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { latitude, longitude, radius = 1500, type = 'restaurant' } = await req.json()

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Search for restaurants and street food
    const keywords = ['restaurant', 'street food', 'local food', 'snacks', 'food stall']
    const keyword = keywords.join('|')
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data)
      return new Response(
        JSON.stringify({ error: data.error_message || 'Places API error', status: data.status }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Transform the results to match our app's data structure
    const places = (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      category: categorizePlace(place.types),
      rating: place.rating || 0,
      distance: `${Math.round((place.geometry?.location ? calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng) : 0) * 1000)}m`,
      image: place.photos?.[0] 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : '/placeholder.svg',
      address: place.vicinity,
      isOpen: place.opening_hours?.open_now ?? null,
      priceLevel: place.price_level,
      totalRatings: place.user_ratings_total || 0,
      location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
      }
    }))

    return new Response(
      JSON.stringify({ places, status: data.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function categorizePlace(types: string[]): string {
  if (types?.includes('bakery')) return 'snacks'
  if (types?.includes('cafe')) return 'snacks'
  if (types?.includes('meal_takeaway')) return 'street-food'
  if (types?.includes('meal_delivery')) return 'street-food'
  if (types?.includes('restaurant')) return 'local-food'
  return 'local-food'
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
