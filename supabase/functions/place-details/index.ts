import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { placeId } = await req.json()

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'Place ID is required' }),
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

    const fields = [
      'name',
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'opening_hours',
      'website',
      'url',
      'rating',
      'user_ratings_total',
      'price_level',
      'photos',
      'reviews',
      'geometry',
      'types',
      'business_status'
    ].join(',')

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Places API error:', data)
      return new Response(
        JSON.stringify({ error: data.error_message || 'Places API error', status: data.status }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const place = data.result

    // Transform photos to include URLs
    const photos = (place.photos || []).slice(0, 5).map((photo: any) => ({
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`,
      attributions: photo.html_attributions
    }))

    // Transform reviews
    const reviews = (place.reviews || []).map((review: any) => ({
      authorName: review.author_name,
      authorPhoto: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
      relativeTime: review.relative_time_description,
      time: review.time
    }))

    const result = {
      id: placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      internationalPhone: place.international_phone_number,
      website: place.website,
      mapsUrl: place.url,
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      priceLevel: place.price_level,
      photos,
      reviews,
      location: place.geometry?.location,
      types: place.types,
      businessStatus: place.business_status,
      openingHours: place.opening_hours ? {
        isOpen: place.opening_hours.open_now,
        weekdayText: place.opening_hours.weekday_text
      } : null
    }

    return new Response(
      JSON.stringify({ place: result }),
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
