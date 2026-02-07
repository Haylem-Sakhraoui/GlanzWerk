import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const resendApiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM

type EmailQueueRow = {
  id: string
  recipient_email: string
  template: string
  payload: Record<string, unknown> | null
  appointment_id: string | null
  guest_customer_id: string | null
  attempts: number
}

function buildGuestVerificationEmail(payload: Record<string, unknown>) {
  const name = String(payload.name ?? 'there')
  const pickupLocation = String(payload.pickupLocation ?? 'your address')
  const verificationUrl = String(payload.verificationUrl ?? '#')

  return {
    subject: 'Confirm your T&A booking request',
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </head>
  <body style="margin:0;background:#111;font-family:Arial,sans-serif;color:#ebebeb;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#111;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="560" cellspacing="0" cellpadding="0" style="background:#1f1f1f;border:1px solid #2c2c2c;padding:28px;">
            <tr>
              <td style="font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#aee5e0;">T&amp;A Booking</td>
            </tr>
            <tr>
              <td style="font-size:22px;text-transform:uppercase;letter-spacing:0.12em;padding-top:12px;">Verify your request</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.6;color:#cfcfcf;padding-top:12px;">
                Hi ${name}, thanks for choosing T&amp;A. Please confirm your booking request for ${pickupLocation}.
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px;">
                <a href="${verificationUrl}" style="display:inline-block;background:#3ab7b9;color:#111;padding:12px 20px;text-decoration:none;text-transform:uppercase;letter-spacing:0.18em;font-size:12px;">Verify booking</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#8f8f8f;padding-top:18px;">
                If the button does not work, copy and paste this link into your browser:<br/>
                ${verificationUrl}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  }
}

function buildAppointmentConfirmedEmail(payload: Record<string, unknown>) {
  const name = String(payload.name ?? 'there')
  const pickupLocation = String(payload.pickupLocation ?? 'your address')
  const scheduledAt = String(payload.scheduledAt ?? '')
  const serviceName = String(payload.serviceName ?? 'Car cleaning')
  const assignedStaff = String(payload.assignedStaff ?? 'our team')

  return {
    subject: 'Your T&A pickup is confirmed',
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </head>
  <body style="margin:0;background:#111;font-family:Arial,sans-serif;color:#ebebeb;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#111;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="560" cellspacing="0" cellpadding="0" style="background:#1f1f1f;border:1px solid #2c2c2c;padding:28px;">
            <tr>
              <td style="font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#aee5e0;">T&amp;A Booking</td>
            </tr>
            <tr>
              <td style="font-size:22px;text-transform:uppercase;letter-spacing:0.12em;padding-top:12px;">Pickup confirmed</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.6;color:#cfcfcf;padding-top:12px;">
                Hi ${name}, your ${serviceName} appointment is confirmed.
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.6;color:#cfcfcf;padding-top:8px;">
                Pickup time: ${scheduledAt || 'To be confirmed'}<br/>
                Location: ${pickupLocation}<br/>
                Assigned: ${assignedStaff}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  }
}

function buildEmailContent(template: string, payload: Record<string, unknown> | null) {
  const data = payload ?? {}
  if (template === 'guest_verification') {
    return buildGuestVerificationEmail(data)
  }
  if (template === 'appointment_confirmed') {
    return buildAppointmentConfirmedEmail(data)
  }
  return {
    subject: 'T&A booking update',
    html: '<p>There is an update regarding your booking.</p>',
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase service role key.' },
      { status: 500 },
    )
  }

  if (!resendApiKey || !emailFrom) {
    return NextResponse.json(
      { error: 'Missing email provider configuration.' },
      { status: 500 },
    )
  }

  const body = await request.json().catch(() => ({}))
  const queueId = body?.queueId as string | undefined

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  let query = supabase
    .from('pcd_email_queue')
    .select(
      'id, recipient_email, template, payload, appointment_id, guest_customer_id, attempts, send_after, status',
    )
    .eq('status', 'pending')

  if (queueId) {
    query = query.eq('id', queueId)
  } else {
    const nowIso = new Date().toISOString()
    query = query.or(`send_after.is.null,send_after.lte.${nowIso}`)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const queueItems = (data ?? []) as EmailQueueRow[]

  if (queueItems.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  let processed = 0

  for (const item of queueItems) {
    await supabase
      .from('pcd_email_queue')
      .update({
        status: 'sending',
        attempts: (item.attempts ?? 0) + 1,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    try {
      const { subject, html } = buildEmailContent(item.template, item.payload)
      const sendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [item.recipient_email],
          subject,
          html,
        }),
      })

      if (!sendResponse.ok) {
        const errorPayload = await sendResponse.text()
        throw new Error(errorPayload || 'Email provider error')
      }

      await supabase
        .from('pcd_email_queue')
        .update({
          status: 'sent',
          last_error: null,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (item.appointment_id) {
        await supabase.from('pcd_appointment_logs').insert({
          appointment_id: item.appointment_id,
          actor_type: 'system',
          actor_id: null,
          action: 'email_sent',
          message: `Email ${item.template} sent`,
        })
      }

      processed += 1
    } catch (sendError: any) {
      await supabase
        .from('pcd_email_queue')
        .update({
          status: 'failed',
          last_error: sendError?.message || 'Email send failed',
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', item.id)
    }
  }

  return NextResponse.json({ success: true, processed })
}
