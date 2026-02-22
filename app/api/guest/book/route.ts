import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getVehicleCategory(carType: string) {
  if (carType === 'bus') {
    return 'BUS_8_SEATS'
  }
  return 'CAR'
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Missing Supabase environment variables.' },
      { status: 500 },
    )
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const {
    name,
    email,
    phone,
    washTypeId,
    carType,
    pickupLocation,
    pickupLat,
    pickupLng,
    preferredLanguage,
    notes,
  } = payload as {
    name?: string
    email?: string
    phone?: string
    washTypeId?: string
    carType?: string
    pickupLocation?: string
    pickupLat?: number | null
    pickupLng?: number | null
    preferredLanguage?: string
    notes?: string
  }

  const normalizedEmail = String(email ?? '').trim().toLowerCase()

  if (
    !name ||
    !normalizedEmail ||
    !normalizedEmail.includes('@') ||
    !phone ||
    !washTypeId ||
    !pickupLocation ||
    !carType
  ) {
    return NextResponse.json(
      { error: 'Missing required booking details.' },
      { status: 400 },
    )
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      },
    },
  )

  const { data: existingCustomer, error: customerError } = await supabase
    .from('pcd_customers')
    .select('id')
    .eq('email', normalizedEmail)
    .limit(1)

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 })
  }

  if (existingCustomer && existingCustomer.length > 0) {
    return NextResponse.json(
      { error: 'Email already registered. Please sign in to book.' },
      { status: 409 },
    )
  }

  const { data: existingGuest, error: guestError } = await supabase
    .from('pcd_guest_customers')
    .select('id, verified_at')
    .eq('email', normalizedEmail)
    .limit(1)

  if (guestError) {
    return NextResponse.json({ error: guestError.message }, { status: 500 })
  }

  if (existingGuest && existingGuest.length > 0) {
    const verifiedAt = existingGuest[0]?.verified_at
    return NextResponse.json(
      {
        error: verifiedAt
          ? 'Email already registered. Please sign in to book.'
          : 'Email already registered. Please verify your email before booking again.',
      },
      { status: 409 },
    )
  }

  const { data, error } = await supabase.rpc('pcd_create_guest_booking', {
    p_full_name: name,
    p_phone: phone,
    p_email: normalizedEmail,
    p_wash_type_id: washTypeId,
    p_vehicle_category: getVehicleCategory(carType),
    p_pickup_address: pickupLocation,
    p_pickup_latitude: pickupLat,
    p_pickup_longitude: pickupLng,
    p_notes: notes || null,
    p_preferred_language: preferredLanguage || 'en',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const bookingResult = Array.isArray(data) ? data[0] : data

  if (!bookingResult?.appointment_id || !bookingResult?.verification_token) {
    return NextResponse.json(
      { error: 'Failed to create guest booking.' },
      { status: 500 },
    )
  }

  const origin = new URL(request.url).origin
  const verificationUrl = `${origin}/api/guest/verify?token=${bookingResult.verification_token}`

  const { data: queueId, error: queueError } = await supabase.rpc(
    'pcd_enqueue_email',
    {
      template: 'guest_verification',
      recipient_email: normalizedEmail,
      payload: {
        name,
        pickupLocation,
        verificationUrl,
      },
      appointment_id: bookingResult.appointment_id,
      guest_customer_id: bookingResult.guest_customer_id,
    },
  )

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 })
  }

  await fetch(`${origin}/api/email/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queueId }),
  })

  return NextResponse.json({ success: true })
}
