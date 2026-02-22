'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '../lib/supabaseClient'
import { useLanguage } from './LanguageProvider'

type CarType = 'sedan' | 'suv' | 'electric' | 'luxury' | 'bus'

type WashType = {
  id: string
  code: string
  name_en: string
}

type BookingState = {
  name: string
  email: string
  phone: string
  carType: CarType
  brandModel: string
  pickupLocation: string
  pickupLat: number | null
  pickupLng: number | null
  washTypeId: string
}

export function BookingSection() {
  const { language } = useLanguage()
  const [booking, setBooking] = useState<BookingState>({
    name: '',
    email: '',
    phone: '',
    carType: 'sedan',
    brandModel: '',
    pickupLocation: '',
    pickupLat: null,
    pickupLng: null,
    washTypeId: '',
  })
  const [washTypes, setWashTypes] = useState<WashType[]>([])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<
    { id: string; label: string; placeName: string; latitude: number; longitude: number }[]
  >([])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const { data } = await supabaseBrowser.auth.getUser()
      if (mounted) {
        setUserId(data.user?.id ?? null)
        if (data.user?.email) {
          setBooking((previous) =>
            previous.email
              ? previous
              : {
                  ...previous,
                  email: data.user?.email ?? '',
                },
          )
        }
      }
    }

    async function loadWashTypes() {
      const { data, error } = await supabaseBrowser
        .from('pcd_wash_types')
        .select('id, code, name_en')
        .eq('is_active', true)
      if (error) {
        return
      }
      if (mounted && data) {
        setWashTypes(data)
        setBooking((previous) => {
          if (previous.washTypeId || data.length === 0) {
            return previous
          }
          return {
            ...previous,
            washTypeId: data[0].id,
          }
        })
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

  async function fetchLocationSuggestions(query: string) {
    const trimmed = query.trim()

    if (trimmed.length < 3) {
      setLocationSuggestions([])
      return
    }

    setIsFetchingSuggestions(true)

    try {
      const url = `/api/places/autocomplete?input=${encodeURIComponent(trimmed)}`
      const response = await fetch(url)
      if (!response.ok) {
        setLocationError('Unable to fetch address suggestions.')
        setLocationSuggestions([])
        return
      }

      const json = await response.json()

      if (json.status && json.status !== 'OK') {
        if (json.error_message) {
          setLocationError(json.error_message)
        } else {
          setLocationError('Address suggestions are currently unavailable.')
        }
        setLocationSuggestions([])
        return
      }

      const predictions = Array.isArray(json.predictions) ? json.predictions : []

      const items = predictions.map((prediction: any) => ({
        id: String(prediction.place_id),
        label: String(
          prediction.structured_formatting?.main_text ?? prediction.description,
        ),
        placeName: String(prediction.description),
        latitude: 0,
        longitude: 0,
      }))

      setLocationSuggestions(items)
      setLocationError(null)
    } catch (error) {
      console.error('Address suggestions error', error)
      setLocationError('Address suggestions are currently unavailable.')
      setLocationSuggestions([])
    } finally {
      setIsFetchingSuggestions(false)
    }
  }

  function handleSelectSuggestion(item: {
    id: string
    label: string
    placeName: string
    latitude: number
    longitude: number
  }) {
    handleChange('pickupLocation', item.placeName)
    handleChange('pickupLat', item.latitude)
    handleChange('pickupLng', item.longitude)
    setLocationSuggestions([])
    setLocationError(null)
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Location is not supported on this device.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        handleChange('pickupLat', latitude)
        handleChange('pickupLng', longitude)
        handleChange(
          'pickupLocation',
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        )

        try {
          const url = `/api/places/reverse-geocode?lat=${encodeURIComponent(
            String(latitude),
          )}&lng=${encodeURIComponent(String(longitude))}`
          const response = await fetch(url)
          if (response.ok) {
            const json = await response.json()
            if (
              json.status === 'OK' &&
              Array.isArray(json.results) &&
              json.results[0]?.formatted_address
            ) {
              handleChange('pickupLocation', String(json.results[0].formatted_address))
            }
          }
        } catch (error) {
          console.error('Reverse geocoding error', error)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission was denied.')
        } else {
          setLocationError('Unable to detect your current location.')
        }
      },
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (!booking.washTypeId) {
      setErrorMessage('Please select a service type.')
      return
    }

    if (!booking.email) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const notes = [
        `Car type: ${booking.carType}`,
        `Brand/model: ${booking.brandModel}`,
        `Pickup location: ${booking.pickupLocation}`,
        `Promotion: ${promotionText}`,
      ].join(' | ')

      const preferredLanguage = language

      if (userId) {
        const { error: profileError } = await supabaseBrowser
          .from('pcd_customers')
          .upsert(
            {
              user_id: userId,
              full_name: booking.name,
              phone: booking.phone,
              email: booking.email,
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
      }
      if (userId) {
        const { data: appointmentRow, error: appointmentError } =
          await supabaseBrowser
            .from('pcd_appointments')
            .insert({
              customer_id: userId,
              wash_type_id: booking.washTypeId,
              vehicle_category: getVehicleCategory(booking.carType),
              scheduled_at: null,
              status: 'pending',
              pickup_address: booking.pickupLocation,
              pickup_latitude: booking.pickupLat,
              pickup_longitude: booking.pickupLng,
              notes,
            })
            .select('id')
            .single()

        if (appointmentError) {
          setErrorMessage(appointmentError.message)
          return
        }

        await supabaseBrowser.from('pcd_appointment_logs').insert({
          appointment_id: appointmentRow?.id,
          actor_type: 'client',
          actor_id: userId,
          action: 'booking_created',
          message: 'Client booking created',
        })

        setSuccessMessage(
          language === 'en'
            ? 'Booking received. We will confirm your appointment time shortly.'
            : 'Buchung eingegangen. Wir bestätigen Ihren Termin in Kürze.',
        )
      } else {
        const response = await fetch('/api/guest/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            washTypeId: booking.washTypeId,
            carType: booking.carType,
            brandModel: booking.brandModel,
            pickupLocation: booking.pickupLocation,
            pickupLat: booking.pickupLat,
            pickupLng: booking.pickupLng,
            preferredLanguage,
            notes,
          }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          setErrorMessage(payload.error || 'Unable to create guest booking.')
          return
        }

        setSuccessMessage(
          language === 'en'
            ? 'Booking received. Check your email to verify your request.'
            : 'Buchung eingegangen. Bitte bestätigen Sie Ihre Anfrage per E-Mail.',
        )
      }

      setBooking((previous) => ({
        ...previous,
        brandModel: '',
        pickupLocation: '',
        pickupLat: null,
        pickupLng: null,
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
              {language === 'en'
                ? 'Book your cleaning in under a minute'
                : 'Buchen Sie Ihre Reinigung in unter einer Minute'}
            </h2>
            <p className="text-sm md:text-base text-text-muted mb-4 max-w-xl">
              {language === 'en'
                ? 'Choose your car type and pickup location. We will review your request and assign the best available time.'
                : 'Wählen Sie Ihr Fahrzeug und Ihren Abholort. Wir prüfen Ihre Anfrage und schlagen Ihnen die beste verfügbare Zeit vor.'}
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
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={booking.email}
                  onChange={(event) =>
                    handleChange('email', event.target.value.trim().toLowerCase())
                  }
                  disabled={Boolean(userId)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal disabled:opacity-70"
                  placeholder="you@example.com"
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
              <div className="space-y-1 md:col-span-2">
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
                  onChange={(event) => {
                    const value = event.target.value
                    handleChange('pickupLocation', value)
                    setLocationError(null)
                    fetchLocationSuggestions(value)
                  }}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2 text-sm text-text-light outline-none focus:border-accent-teal"
                  placeholder="Street, house number, city"
                />
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    type="button"
                    disabled={isLocating}
                    onClick={handleUseCurrentLocation}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] bg-brand-primary text-text-light hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLocating ? 'Detecting location...' : 'Use current location'}
                  </button>
                  {isFetchingSuggestions && (
                    <span className="text-[11px] text-text-muted">Searching address suggestions…</span>
                  )}
                </div>
                {locationError && (
                  <p className="mt-1 text-xs text-red-400">{locationError}</p>
                )}
                {locationSuggestions.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-auto rounded border border-white/15 bg-black/70 text-xs text-text-light">
                    {locationSuggestions.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-white/10"
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          {item.placeName}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
                {successMessage && (
                  <p className="text-xs text-accent-teal">{successMessage}</p>
                )}
                {errorMessage && (
                  <p className="text-xs text-red-400">{errorMessage}</p>
                )}
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
