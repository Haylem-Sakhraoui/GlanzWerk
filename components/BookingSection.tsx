'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '../lib/supabaseClient'

type CarType = 'sedan' | 'suv' | 'electric' | 'luxury' | 'bus'

type WashType = {
  id: string
  code: string
  name_en: string
}

type BookingState = {
  name: string
  phone: string
  carType: CarType
  brandModel: string
  pickupLocation: string
  date: string
  time: string
  washTypeId: string
}

export function BookingSection() {
  const [booking, setBooking] = useState<BookingState>({
    name: '',
    phone: '',
    carType: 'sedan',
    brandModel: '',
    pickupLocation: '',
    date: '',
    time: '',
    washTypeId: '',
  })
  const [washTypes, setWashTypes] = useState<WashType[]>([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const { data } = await supabaseBrowser.auth.getUser()
      if (mounted) {
        setUserId(data.user?.id ?? null)
      }
    }

    async function loadWashTypes() {
      const { data, error } = await supabaseBrowser.from('pcd_wash_types').select('id, code, name_en').eq('is_active', true)
      if (error) {
        return
      }
      if (mounted && data) {
        setWashTypes(data)
        if (!booking.washTypeId && data.length > 0) {
          setBooking((previous) => ({ ...previous, washTypeId: data[0].id }))
        }
      }
    }

    loadUser()
    loadWashTypes()

    return () => {
      mounted = false
    }
  }, [])

  const promotionText = useMemo(
    () => 'For every 2 cleanings at our hub, get 50% off on the 3rd cleaning.',
    [],
  )

  function handleChange<Field extends keyof BookingState>(field: Field, value: BookingState[Field]) {
    setBooking((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function getVehicleCategory(carType: CarType) {
    if (carType === 'bus') {
      return 'BUS_8_SEATS'
    }
    return 'CAR'
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (!userId) {
      setErrorMessage('Please create an account or log in before booking.')
      return
    }

    if (!booking.date || !booking.time) {
      setErrorMessage('Please select a preferred date and time.')
      return
    }

    if (!booking.washTypeId) {
      setErrorMessage('Please select a service type.')
      return
    }

    setLoading(true)

    try {
      const scheduledAt = new Date(`${booking.date}T${booking.time}`)

      const notes = [
        `Car type: ${booking.carType}`,
        `Brand/model: ${booking.brandModel}`,
        `Pickup location: ${booking.pickupLocation}`,
        `Promotion: ${promotionText}`,
      ].join(' | ')

      const preferredLanguage = 'en'

      const { error: profileError } = await supabaseBrowser
        .from('pcd_customers')
        .upsert(
          {
            user_id: userId,
            full_name: booking.name,
            phone: booking.phone,
            preferred_language: preferredLanguage,
          },
          {
            onConflict: 'user_id',
          },
        )

      if (profileError) {
        setErrorMessage(profileError.message)
        return
      }

      const { error: appointmentError } = await supabaseBrowser.from('pcd_appointments').insert({
        customer_id: userId,
        wash_type_id: booking.washTypeId,
        vehicle_category: getVehicleCategory(booking.carType),
        scheduled_at: scheduledAt.toISOString(),
        notes,
      })

      if (appointmentError) {
        setErrorMessage(appointmentError.message)
        return
      }

      setSuccessMessage('Booking received. We will confirm your appointment shortly.')
      setBooking((previous) => ({
        ...previous,
        brandModel: '',
        pickupLocation: '',
        date: '',
        time: '',
      }))
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="booking" className="bg-[#2b2b2b]">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10 items-start">
          <div>
            <h2 className="font-league text-[30px] md:text-[36px] uppercase text-text-light mb-2">
              Book your cleaning in under a minute
            </h2>
            <p className="text-sm md:text-base text-text-muted mb-4 max-w-xl">
              Choose your car type, tell us where to pick it up, and select the best time for you. We handle the rest.
            </p>
            <p className="text-xs text-text-muted mb-6">
              Wählen Sie Ihr Fahrzeug, Ihren Abholort und Ihre Wunschzeit. Wir kümmern uns um den Rest.
            </p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={booking.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={booking.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                  placeholder="+49 ..."
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Car type
                </label>
                <select
                  value={booking.carType}
                  onChange={(event) => handleChange('carType', event.target.value as CarType)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="electric">Electric</option>
                  <option value="luxury">Luxury</option>
                  <option value="bus">Bus (8 seats)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Car brand / model
                </label>
                <input
                  type="text"
                  required
                  value={booking.brandModel}
                  onChange={(event) => handleChange('brandModel', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                  placeholder="e.g. BMW 3 Series, Tesla Model 3"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Pickup location
                </label>
                <input
                  type="text"
                  required
                  value={booking.pickupLocation}
                  onChange={(event) => handleChange('pickupLocation', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                  placeholder="Street, house number, city"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Preferred date
                </label>
                <input
                  type="date"
                  required
                  value={booking.date}
                  onChange={(event) => handleChange('date', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Preferred time
                </label>
                <input
                  type="time"
                  required
                  value={booking.time}
                  onChange={(event) => handleChange('time', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em]">
                  Service type
                </label>
                <select
                  value={booking.washTypeId}
                  onChange={(event) => handleChange('washTypeId', event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                >
                  {washTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-brand-primary text-text-light text-sm uppercase tracking-[0.18em] px-10 py-2.5 hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending booking...' : 'Confirm booking'}
                </button>
                {successMessage && <p className="text-xs text-accent-teal">{successMessage}</p>}
                {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
              </div>
            </form>
          </div>
          <div className="bg-neutral-bg border border-white/10 px-5 py-6 space-y-4">
            <h3 className="font-gothic text-lg text-text-light">Current promotion</h3>
            <p className="text-sm text-text-muted">
              {promotionText}
            </p>
            <p className="text-xs text-text-muted">
              Angebot: Nach zwei Reinigungen in unserem Hub erhalten Sie 50% Rabatt auf die dritte Reinigung.
            </p>
            <div className="border-t border-white/10 pt-4 text-xs text-text-muted space-y-1">
              <p>Confirmation: You will receive an email with all booking details.</p>
              <p>Bestätigung: Sie erhalten alle Details per E-Mail.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

