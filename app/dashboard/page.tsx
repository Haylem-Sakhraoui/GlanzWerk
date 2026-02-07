'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '../../lib/supabaseClient'
import { useLanguage } from '../../components/LanguageProvider'

type AppointmentRow = {
  id: string
  created_at: string
  scheduled_at: string | null
  status: string | null
  notes: string | null
  pickup_address: string | null
  pickup_latitude: number | null
  pickup_longitude: number | null
  customer?: {
    full_name: string | null
    phone: string | null
  } | null
  wash?: {
    name_en: string | null
  } | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const title = language === 'en' ? 'Appointment dashboard' : 'Terminübersicht'
  const subtitle =
    language === 'en'
      ? 'Track the status of your booking requests and upcoming pickup times.'
      : 'Verfolgen Sie den Status Ihrer Buchungsanfragen und bevorstehenden Abholtermine.'
  const loadingLabel =
    language === 'en' ? 'Loading appointments…' : 'Termine werden geladen…'
  const emptyLabel =
    language === 'en' ? 'No appointments found.' : 'Keine Termine gefunden.'
  const requestReceived =
    language === 'en' ? 'Request received' : 'Anfrage eingegangen'
  const serviceLabel = language === 'en' ? 'Service' : 'Service'
  const pickupLabel = language === 'en' ? 'Pickup location' : 'Abholort'
  const scheduledPickupLabel =
    language === 'en' ? 'Scheduled pickup' : 'Geplante Abholung'
  const awaitingLabel =
    language === 'en' ? 'Awaiting confirmation' : 'Bestätigung ausstehend'
  const notProvided = language === 'en' ? 'Not provided' : 'Nicht angegeben'
  const errorFallback =
    language === 'en'
      ? 'Failed to load appointments.'
      : 'Termine konnten nicht geladen werden.'

  const loadForCurrentUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: userData, error: userError } = await supabaseBrowser.auth.getUser()
      if (userError || !userData.user) {
        setLoading(false)
        router.push('/')
        return
      }

      const userId = userData.user.id
      const { data: adminRow } = await supabaseBrowser
        .from('pcd_admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (adminRow) {
        router.push('/dashboard/admin')
        return
      }

      const { data, error } = await supabaseBrowser
        .from('pcd_appointments')
        .select(
          `
            id,
            created_at,
            scheduled_at,
            status,
            notes,
            pickup_address,
            pickup_latitude,
            pickup_longitude,
            customer:pcd_customers(full_name, phone),
            wash:pcd_wash_types(name_en)
          `,
        )
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      const rows = (data ?? []) as any[]

      const normalized: AppointmentRow[] = rows.map((row) => ({
        ...row,
        customer: Array.isArray(row.customer)
          ? row.customer[0] ?? null
          : row.customer ?? null,
        wash: Array.isArray(row.wash) ? row.wash[0] ?? null : row.wash ?? null,
      }))

      setAppointments(normalized)
    } catch (err: any) {
      setError(err.message ?? errorFallback)
    } finally {
      setLoading(false)
    }
  }, [router, errorFallback])

  useEffect(() => {
    loadForCurrentUser()
  }, [loadForCurrentUser])

  function getStatusStyles(status?: string | null) {
    const label = (status || 'pending').toLowerCase()
    if (label === 'assigned' || label === 'confirmed') {
      return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40'
    }
    if (label === 'cancelled') {
      return 'bg-red-500/15 text-red-200 border-red-400/40'
    }
    if (label === 'completed') {
      return 'bg-blue-500/15 text-blue-200 border-blue-400/40'
    }
    return 'bg-yellow-500/15 text-yellow-200 border-yellow-400/40'
  }

  return (
    <section className="bg-neutral-bg min-h-screen">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-16">
        <div className="mb-8">
          <h1 className="font-league text-[32px] md:text-[40px] uppercase text-text-light">
            {title}
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-600 bg-red-900/40 px-4 py-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-text-muted">{loadingLabel}</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-text-muted">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {appointments.map((appointment) => {
              const createdLabel = new Date(appointment.created_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
              const scheduledLabel = appointment.scheduled_at
                ? new Date(appointment.scheduled_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : awaitingLabel
              const statusLabel = (appointment.status || 'pending').toUpperCase()

              return (
                <div
                  key={appointment.id}
                  className="rounded border border-white/10 bg-[#3a3a3a] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                        {requestReceived}
                      </p>
                      <p className="text-text-light text-sm">{createdLabel}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${getStatusStyles(
                        appointment.status,
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-text-light">
                    <p className="text-text-muted text-[11px] uppercase tracking-[0.16em]">
                      {serviceLabel}
                    </p>
                    <p>{appointment.wash?.name_en || serviceLabel}</p>
                  </div>
                  <div className="space-y-1 text-sm text-text-light">
                    <p className="text-text-muted text-[11px] uppercase tracking-[0.16em]">
                      {pickupLabel}
                    </p>
                    <p>{appointment.pickup_address || notProvided}</p>
                  </div>
                  <div className="space-y-1 text-sm text-text-light">
                    <p className="text-text-muted text-[11px] uppercase tracking-[0.16em]">
                      {scheduledPickupLabel}
                    </p>
                    <p>{scheduledLabel}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
