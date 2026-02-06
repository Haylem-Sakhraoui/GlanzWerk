import { NextResponse } from 'next/server'

const apiKey =
  process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = (searchParams.get('input') || '').trim()

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [], status: 'OK' })
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        predictions: [],
        status: 'ERROR',
        error_message:
          'Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.',
      },
      { status: 500 },
    )
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input,
  )}&types=address&language=de&components=country:de&key=${apiKey}`

  try {
    const response = await fetch(url)
    const json = await response.json()

    return NextResponse.json(json, {
      status: response.status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        predictions: [],
        status: 'ERROR',
        error_message: 'Failed to fetch address suggestions.',
      },
      { status: 500 },
    )
  }
}

