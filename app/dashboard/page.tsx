'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '../../lib/supabaseClient'

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

type PendingUpdate = {
  date: string
  time: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updates, setUpdates] = useState<Record<string, PendingUpdate>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadForCurrentUser()
  }, [])

  async function loadForCurrentUser() {
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
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
        return
      }

      setAppointments(data ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  function handleUpdateChange(id: string, field: keyof PendingUpdate, value: string) {
    setUpdates((previous) => ({
      ...previous,
      [id]: {
        date: previous[id]?.date ?? '',
        time: previous[id]?.time ?? '',
        [field]: value,
      },
    }))
  }

  async function handleAssign(id: string) {
    const current = updates[id]
    if (!current?.date || !current?.time) {
      setError('Please select both a pickup date and time.')
      return
    }

    const scheduled = new Date(`${current.date}T${current.time}`)
    if (Number.isNaN(scheduled.getTime())) {
      setError('The selected date or time is invalid.')
      return
    }

    setSavingId(id)
    setError(null)

    try {
      const { error } = await supabaseBrowser
        .from('pcd_appointments')
        .update({
          scheduled_at: scheduled.toISOString(),
          status: 'confirmed',
        })
        .eq('id', id)

      if (error) {
        setError(error.message)
        return
      }

      try {
        await supabaseBrowser.functions.invoke('send-confirmation-email', {
          body: {
            appointmentId: id,
          },
        })
      } catch (invokeError) {
        console.error('Email notification error', invokeError)
      }

      await loadAppointments()
    } catch (err: any) {
      setError(err.message ?? 'Failed to update appointment.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="bg-neutral-bg min-h-screen">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-16">
        <div className="mb-8">
          <h1 className="font-league text-[32px] md:text-[40px] uppercase text-text-light">
            Appointment dashboard
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl">
            Review pending appointments, assign pickup date and time, confirm bookings, and trigger
            email notifications to your clients.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-600 bg-red-900/40 px-4 py-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-text-muted">Loading appointments…</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-text-muted">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded bg-[#3a3a3a]">
            <table className="min-w-full text-xs md:text-sm text-left">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-3 py-2 font-normal text-text-muted">Created</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Client</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Contact</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Service</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Pickup address</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Status</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Assign pickup</th>
                  <th className="px-3 py-2 font-normal text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const update = updates[appointment.id] ?? { date: '', time: '' }
                  const createdLabel = new Date(
                    appointment.created_at,
                  ).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                  const scheduledLabel = appointment.scheduled_at
                    ? new Date(appointment.scheduled_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : 'Not assigned'

                  return (
                    <tr key={appointment.id} className="border-t border-white/10">
                      <td className="px-3 py-3 align-top">
                        <div className="space-y-1">
                          <p className="text-text-light">{createdLabel}</p>
                          <p className="text-[11px] text-text-muted">
                            ID: {appointment.id.slice(0, 8)}…
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="text-text-light">
                          {appointment.customer?.full_name || 'Unknown'}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="text-text-light">
                          {appointment.customer?.phone || '—'}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="text-text-light">
                          {appointment.wash?.name_en || 'Service'}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="text-text-light">
                          {appointment.pickup_address || 'Not provided'}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="space-y-1">
                          <span className="inline-flex items-center rounded-full bg-black/60 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-text-light">
                            {appointment.status || 'pending'}
                          </span>
                          <p className="text-[11px] text-text-muted">{scheduledLabel}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex flex-col gap-2">
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
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <button
                          type="button"
                          disabled={savingId === appointment.id}
                          onClick={() => handleAssign(appointment.id)}
                          className="inline-flex items-center justify-center rounded bg-brand-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-light hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {savingId === appointment.id ? 'Saving…' : 'Assign & confirm'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
