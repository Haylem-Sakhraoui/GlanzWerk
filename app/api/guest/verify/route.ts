import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function renderHtml(status: 'success' | 'error', message: string) {
  const title = status === 'success' ? 'Booking verified' : 'Verification failed'
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${title}</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #111; color: #ebebeb; }
      .container { max-width: 560px; margin: 12vh auto; background: #1f1f1f; border: 1px solid #2c2c2c; padding: 32px; }
      h1 { font-size: 22px; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px; }
      p { font-size: 14px; color: #cfcfcf; line-height: 1.6; }
      a { color: #3ab7b9; text-decoration: none; }
      .badge { display: inline-block; padding: 6px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; background: ${
        status === 'success' ? '#15474e' : '#5c1b1b'
      }; margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="badge">${status === 'success' ? 'Verified' : 'Action required'}</div>
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="/">Return to homepage</a></p>
    </div>
  </body>
</html>`
}

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse(
      renderHtml('error', 'Missing configuration for verification.'),
      { status: 500, headers: { 'Content-Type': 'text/html' } },
    )
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return new NextResponse(
      renderHtml('error', 'Verification token is missing.'),
      { status: 400, headers: { 'Content-Type': 'text/html' } },
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

  const { error } = await supabase.rpc('pcd_verify_guest_booking', {
    verification_token: token,
  })

  if (error) {
    return new NextResponse(
      renderHtml('error', error.message || 'Verification failed.'),
      { status: 400, headers: { 'Content-Type': 'text/html' } },
    )
  }

  return new NextResponse(
    renderHtml(
      'success',
      'Thanks for confirming your booking. Our team will contact you with the final pickup time.',
    ),
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )
}
