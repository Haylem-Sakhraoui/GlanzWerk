'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '../../../lib/supabaseClient'
import { useLanguage } from '../../../components/LanguageProvider'

type AppointmentRow = {
  id: string
  created_at: string
  scheduled_at: string | null
  status: string | null
  notes: string | null
  pickup_address: string | null
  assigned_staff: string | null
  customer?: {
    full_name: string | null
    phone: string | null
    email: string | null
  } | null
  guest?: {
    id: string
    full_name: string | null
    phone: string | null
    email: string | null
    verified_at: string | null
  } | null
  wash?: {
    name_en: string | null
  } | null
}

type PendingUpdate = {
  date: string
  time: string
  staff: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updates, setUpdates] = useState<Record<string, PendingUpdate>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: userData, error: userError } = await supabaseBrowser.auth.getUser()
      if (userError || !userData.user) {
        setLoading(false)
        router.push('/')
        return
      }

      const { data: adminRow } = await supabaseBrowser
        .from('pcd_admins')
        .select('user_id')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (!adminRow) {
        router.push('/dashboard')
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
            assigned_staff,
            customer:pcd_customers(full_name, phone, email),
            guest:pcd_guest_customers(id, full_name, phone, email, verified_at),
            wash:pcd_wash_types(name_en)
          `,
        )
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      const rows = (data ?? []) as any[]
      const normalized: AppointmentRow[] = rows.map((row) => ({
        ...row,
        customer: Array.isArray(row.customer) ? row.customer[0] ?? null : row.customer ?? null,
        guest: Array.isArray(row.guest) ? row.guest[0] ?? null : row.guest ?? null,
        wash: Array.isArray(row.wash) ? row.wash[0] ?? null : row.wash ?? null,
      }))

      setAppointments(normalized)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  function handleUpdateChange(id: string, field: keyof PendingUpdate, value: string) {
    setUpdates((previous) => ({
      ...previous,
      [id]: {
        date: previous[id]?.date ?? '',
        time: previous[id]?.time ?? '',
        staff: previous[id]?.staff ?? '',
        [field]: value,
      },
    }))
  }

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

  const title =
    language === 'en' ? 'Admin dashboard' : 'Admin-Übersicht'
  const subtitle =
    language === 'en'
      ? 'Assign pickup times, track verification status, and notify clients when confirmed.'
      : 'Weisen Sie Abholzeiten zu, verfolgen Sie den Verifizierungsstatus und benachrichtigen Sie Kunden.'
  const loadingLabel =
    language === 'en' ? 'Loading appointments…' : 'Termine werden geladen…'
  const emptyLabel =
    language === 'en' ? 'No appointments found.' : 'Keine Termine gefunden.'
  const selectPickupLabel =
    language === 'en'
      ? 'Please select both a pickup date and time.'
      : 'Bitte wählen Sie Datum und Uhrzeit für die Abholung.'
  const invalidPickupLabel =
    language === 'en'
      ? 'The selected date or time is invalid.'
      : 'Das ausgewählte Datum oder die Uhrzeit ist ungültig.'
  const guestNotVerifiedLabel =
    language === 'en'
      ? 'Guest email is not verified yet.'
      : 'Die E-Mail des Gasts ist noch nicht bestätigt.'
  const missingEmailLabel =
    language === 'en'
      ? 'Missing client email address.'
      : 'E-Mail-Adresse des Kunden fehlt.'
  const failedUpdateLabel =
    language === 'en'
      ? 'Failed to update appointment.'
      : 'Termin konnte nicht aktualisiert werden.'
  const guestTagLabel = language === 'en' ? 'Guest' : 'Gast'
  const clientTagLabel = language === 'en' ? 'Client' : 'Kunde'
  const createdPrefix = language === 'en' ? 'Created' : 'Erstellt'
  const pickupPrefix = language === 'en' ? 'Pickup' : 'Abholung'
  const emailVerifiedLabel =
    language === 'en' ? 'Email verified' : 'E-Mail bestätigt'
  const emailPendingLabel =
    language === 'en' ? 'Email pending' : 'E-Mail ausstehend'
  const serviceLabel = language === 'en' ? 'Service' : 'Service'
  const pickupAddressLabel =
    language === 'en' ? 'Pickup address' : 'Abholadresse'
  const notProvided =
    language === 'en' ? 'Not provided' : 'Nicht angegeben'
  const notesLabel = language === 'en' ? 'Notes' : 'Notizen'
  const assignPickupLabel =
    language === 'en' ? 'Assign pickup' : 'Abholung zuweisen'
  const staffPlaceholder =
    language === 'en' ? 'Assigned staff' : 'Zugewiesenes Team'
  const assignConfirmLabel =
    language === 'en' ? 'Assign & confirm' : 'Zuweisen & bestätigen'
  const savingLabel = language === 'en' ? 'Saving…' : 'Speichern…'

  async function handleAssign(appointment: AppointmentRow) {
    const current = updates[appointment.id]
    if (!current?.date || !current?.time) {
      setError(selectPickupLabel)
      return
    }

    const scheduled = new Date(`${current.date}T${current.time}`)
    if (Number.isNaN(scheduled.getTime())) {
      setError(invalidPickupLabel)
      return
    }

    const displayName =
      appointment.customer?.full_name || appointment.guest?.full_name || 'Client'
    const recipientEmail = appointment.customer?.email || appointment.guest?.email || ''

    if (appointment.guest && !appointment.guest.verified_at) {
      setError(guestNotVerifiedLabel)
      return
    }

    if (!recipientEmail) {
      setError(missingEmailLabel)
      return
    }

    setSavingId(appointment.id)
    setError(null)

    try {
      const { error } = await supabaseBrowser
        .from('pcd_appointments')
        .update({
          scheduled_at: scheduled.toISOString(),
          status: 'assigned',
          assigned_staff: current.staff || null,
        })
        .eq('id', appointment.id)

      if (error) {
        setError(error.message)
        return
      }

      await supabaseBrowser.from('pcd_appointment_logs').insert({
        appointment_id: appointment.id,
        actor_type: 'admin',
        actor_id: null,
        action: 'appointment_assigned',
        message: 'Appointment assigned with pickup time',
        meta: {
          scheduled_at: scheduled.toISOString(),
          assigned_staff: current.staff || null,
        },
      })

      const { data: queueId, error: queueError } = await supabaseBrowser.rpc(
        'pcd_enqueue_email',
        {
          template: 'appointment_confirmed',
          recipient_email: recipientEmail,
          payload: {
            name: displayName,
            pickupLocation: appointment.pickup_address || '',
            scheduledAt: scheduled.toLocaleString(),
            serviceName: appointment.wash?.name_en || 'Car cleaning',
            assignedStaff: current.staff || 'T&A team',
          },
          appointment_id: appointment.id,
          guest_customer_id: appointment.guest?.id ?? null,
        },
      )

      if (queueError) {
        setError(queueError.message)
        return
      }

      await fetch('/api/email/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId }),
      })

      await loadAppointments()
    } catch (err: any) {
      setError(err.message ?? failedUpdateLabel)
    } finally {
      setSavingId(null)
    }
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
          <div className="grid grid-cols-1 gap-4">
            {appointments.map((appointment) => {
              const update = updates[appointment.id] ?? { date: '', time: '', staff: '' }
              const createdLabel = new Date(appointment.created_at).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
              })
              const scheduledLabel = appointment.scheduled_at
                ? new Date(appointment.scheduled_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : 'Not assigned'
              const statusLabel = (appointment.status || 'pending').toUpperCase()
              const displayName =
                appointment.customer?.full_name || appointment.guest?.full_name || 'Client'
              const displayPhone =
                appointment.customer?.phone || appointment.guest?.phone || '—'
              const displayEmail =
                appointment.customer?.email || appointment.guest?.email || '—'
              const guestTag = appointment.guest ? guestTagLabel : clientTagLabel

              return (
                <div
                  key={appointment.id}
                  className="rounded border border-white/10 bg-[#3a3a3a] p-4 md:p-5 flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                        {guestTag}
                      </p>
                      <p className="text-text-light text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-text-muted">{displayEmail}</p>
                      <p className="text-xs text-text-muted">{displayPhone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.16em] ${getStatusStyles(
                          appointment.status,
                        )}`}
                      >
                        {statusLabel}
                      </span>
                      <p className="text-[11px] text-text-muted">
                        {createdPrefix} {createdLabel}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {pickupPrefix} {scheduledLabel}
                      </p>
                      {appointment.guest && (
                        <p className="text-[11px] text-text-muted">
                          {appointment.guest.verified_at ? emailVerifiedLabel : emailPendingLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
                    <div className="space-y-2 text-sm text-text-light">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                          {serviceLabel}
                        </p>
                        <p>{appointment.wash?.name_en || serviceLabel}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                          {pickupAddressLabel}
                        </p>
                        <p>{appointment.pickup_address || notProvided}</p>
                      </div>
                      {appointment.notes && (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                            {notesLabel}
                          </p>
                          <p className="text-xs text-text-muted">{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded border border-white/10 bg-black/40 p-3 space-y-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                        {assignPickupLabel}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="date"
                          value={update.date}
                          onChange={(event) =>
                            handleUpdateChange(appointment.id, 'date', event.target.value)
                          }
                          className="w-full bg-black/40 border border-white/20 px-2 py-1.5 text-xs text-text-light outline-none focus:border-accent-teal"
                        />
                        <input
                          type="time"
                          value={update.time}
                          onChange={(event) =>
                            handleUpdateChange(appointment.id, 'time', event.target.value)
                          }
                          className="w-full bg-black/40 border border-white/20 px-2 py-1.5 text-xs text-text-light outline-none focus:border-accent-teal"
                        />
                        <input
                          type="text"
                          value={update.staff}
                          onChange={(event) =>
                            handleUpdateChange(appointment.id, 'staff', event.target.value)
                          }
                          className="w-full bg-black/40 border border-white/20 px-2 py-1.5 text-xs text-text-light outline-none focus:border-accent-teal"
                          placeholder={staffPlaceholder}
                        />
                        <button
                          type="button"
                          disabled={savingId === appointment.id}
                          onClick={() => handleAssign(appointment)}
                          className="inline-flex items-center justify-center rounded bg-brand-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-light hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {savingId === appointment.id ? savingLabel : assignConfirmLabel}
                        </button>
                      </div>
                    </div>
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
