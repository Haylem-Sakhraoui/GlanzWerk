'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '../../../lib/supabaseClient'
import { useLanguage } from '../../../components/LanguageProvider'

export default function ResetPasswordPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function hydrateSession() {
      setLoading(true)
      setError(null)
      setMessage(null)

      try {
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')
        if (code) {
          const { error: exchangeError } =
            await supabaseBrowser.auth.exchangeCodeForSession(window.location.href)
          if (exchangeError) {
            if (mounted) {
              setError(exchangeError.message)
            }
          }
        }

        const { data } = await supabaseBrowser.auth.getSession()
        if (!mounted) return
        if (data.session) {
          setReady(true)
        } else {
          setError(
            language === 'en'
              ? 'The reset link is invalid or expired.'
              : 'Der Reset-Link ist ungültig oder abgelaufen.',
          )
        }
      } catch (err: any) {
        if (mounted) {
          setError(
            err?.message ||
              (language === 'en'
                ? 'Unable to load reset link.'
                : 'Reset-Link konnte nicht geladen werden.'),
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    hydrateSession()

    return () => {
      mounted = false
    }
  }, [language])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 8) {
      setError(
        language === 'en'
          ? 'Password must be at least 8 characters.'
          : 'Passwort muss mindestens 8 Zeichen lang sein.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        language === 'en' ? 'Passwords do not match.' : 'Passwörter stimmen nicht überein.',
      )
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabaseBrowser.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setMessage(
        language === 'en'
          ? 'Password updated. Redirecting to your dashboard...'
          : 'Passwort aktualisiert. Weiterleitung zum Dashboard...',
      )

      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'en'
            ? 'Unable to update password.'
            : 'Passwort konnte nicht aktualisiert werden.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#2b2b2b] min-h-[70vh] flex items-center">
      <div className="max-w-[540px] mx-auto w-full px-4 py-16">
        <div className="bg-[#3f3f3f] border border-white/10 px-6 py-8 rounded-lg">
          <h1 className="font-league text-[30px] md:text-[36px] uppercase text-text-light mb-2">
            {language === 'en' ? 'Reset password' : 'Passwort zurücksetzen'}
          </h1>
          <p className="text-sm text-text-muted mb-6">
            {language === 'en'
              ? 'Choose a new password to access your account.'
              : 'Wählen Sie ein neues Passwort, um auf Ihr Konto zuzugreifen.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs text-text-muted uppercase tracking-[0.18em] mb-1">
                {language === 'en' ? 'New password' : 'Neues Passwort'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading || !ready}
                className="w-full bg-black/40 border border-white/20 px-3 py-2.5 text-sm text-text-light outline-none focus:border-accent-teal rounded disabled:opacity-60"
                placeholder={
                  language === 'en' ? 'Minimum 8 characters' : 'Mindestens 8 Zeichen'
                }
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-text-muted uppercase tracking-[0.18em] mb-1">
                {language === 'en' ? 'Confirm password' : 'Passwort bestätigen'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading || !ready}
                className="w-full bg-black/40 border border-white/20 px-3 py-2.5 text-sm text-text-light outline-none focus:border-accent-teal rounded disabled:opacity-60"
                placeholder={
                  language === 'en' ? 'Confirm your password' : 'Passwort bestätigen'
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading || !ready}
              className="mt-2 w-full bg-brand-primary hover:bg-brand-dark text-text-light text-sm uppercase tracking-[0.18em] py-3 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? language === 'en'
                  ? 'Updating...'
                  : 'Aktualisieren...'
                : language === 'en'
                ? 'Update password'
                : 'Passwort aktualisieren'}
            </button>

            {message && (
              <div className="p-3 bg-green-900/30 border border-green-700 rounded">
                <p className="text-xs text-green-400">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
