import { NextResponse } from 'next/server'

const apiKey =
  process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      {
        status: 'INVALID_REQUEST',
        error_message: 'Missing latitude or longitude',
        results: [],
      },
      { status: 400 },
    )
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error_message:
          'Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.',
        results: [],
      },
      { status: 500 },
    )
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
    `${lat},${lng}`,
  )}&language=de&key=${apiKey}`

  try {
    const response = await fetch(url)
    const json = await response.json()

    return NextResponse.json(json, {
      status: response.status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error_message: 'Failed to reverse geocode location.',
        results: [],
      },
      { status: 500 },
    )
  }
}

