'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '../lib/supabaseClient'
import { useLanguage } from './LanguageProvider'
import { useRouter } from 'next/navigation'

type Mode = 'signup' | 'login'

export function AuthPanel() {
  const { language } = useLanguage()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25

    setPasswordStrength(strength)
  }, [password])

  // Validate form
  const validateForm = () => {
    setError(null)

    if (mode === 'signup') {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError(
          language === 'en'
            ? 'Please enter a valid email address'
            : 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        )
        return false
      }

      // Password validation
      if (password.length < 8) {
        setError(
          language === 'en'
            ? 'Password must be at least 8 characters'
            : 'Passwort muss mindestens 8 Zeichen lang sein'
        )
        return false
      }

      if (passwordStrength < 50) {
        setError(
          language === 'en'
            ? 'Password is too weak. Include uppercase letters and numbers'
            : 'Passwort ist zu schwach. Verwenden Sie Großbuchstaben und Zahlen'
        )
        return false
      }

      // Confirm password
      if (password !== confirmPassword) {
        setError(
          language === 'en'
            ? 'Passwords do not match'
            : 'Passwörter stimmen nicht überein'
        )
        return false
      }

      // Full name validation
      if (fullName.trim().length < 2) {
        setError(
          language === 'en'
            ? 'Please enter your full name'
            : 'Bitte geben Sie Ihren vollständigen Namen ein'
        )
        return false
      }
    } else {
      // Login validation
      if (!email || !password) {
        setError(
          language === 'en'
            ? 'Please fill in all fields'
            : 'Bitte füllen Sie alle Felder aus'
        )
        return false
      }
    }

    return true
  }

  // Handle form submission
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setError(
              language === 'en'
                ? 'An account with this email already exists. Please login instead.'
                : 'Ein Konto mit dieser E-Mail existiert bereits. Bitte melden Sie sich stattdessen an.'
            )
          } else {
            setError(signUpError.message)
          }
          return
        }

        if (data.user) {
          setMessage(
            language === 'en'
              ? '🎉 Account created! Please check your email to confirm your address.'
              : '🎉 Konto erstellt! Bitte prüfen Sie Ihre E-Mails, um Ihre Adresse zu bestätigen.'
          )

          // Reset form
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setFullName('')
          
          // Auto-switch to login after successful signup
          setTimeout(() => {
            setMode('login')
            setMessage(null)
          }, 3000)
        }
      } else {
        const { error: signInError, data } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError(
              language === 'en'
                ? 'Invalid email or password'
                : 'Ungültige E-Mail oder Passwort'
            )
          } else {
            setError(signInError.message)
          }
          return
        }

        if (data.user) {
          setMessage(
            language === 'en'
              ? '✅ Login successful! Redirecting...'
              : '✅ Login erfolgreich! Weiterleitung...'
          )

          // Redirect to dashboard after successful login
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 1000)
        }
      }
    } catch (err: any) {
      setError(
        language === 'en'
          ? 'Something went wrong. Please try again.'
          : 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
      )
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-500'
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-yellow-500'
    if (passwordStrength <= 75) return 'bg-yellow-300'
    return 'bg-green-500'
  }

  // Reset form when switching modes
  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode)
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
    setFullName('')
  }

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError(
        language === 'en'
          ? 'Please enter your email address first'
          : 'Bitte geben Sie zuerst Ihre E-Mail-Adresse ein'
      )
      return
    }

    setLoading(true)
    try {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage(
        language === 'en'
          ? 'Password reset link sent! Check your email.'
          : 'Passwort-Reset-Link gesendet! Überprüfen Sie Ihre E-Mails.'
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="auth" className="bg-neutral-bg">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 items-start">
          {/* Left column - Info */}
          <div className="space-y-3">
            <h2 className="font-league text-[28px] md:text-[34px] uppercase text-text-light">
              {language === 'en'
                ? 'Create your CarCleaner account'
                : 'Erstellen Sie Ihr CarCleaner-Konto'}
            </h2>
            <p className="text-sm md:text-base text-text-muted max-w-xl">
              {language === 'en'
                ? 'Save your car details, see your booking history, and rebook your favorite package in seconds.'
                : 'Speichern Sie Ihre Fahrzeugdaten, sehen Sie Ihre Buchungshistorie und buchen Sie Ihre Lieblingsreinigung in Sekunden neu.'}
            </p>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                <span className="text-xs text-text-muted">
                  {language === 'en' ? 'Save vehicle details' : 'Fahrzeugdaten speichern'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                <span className="text-xs text-text-muted">
                  {language === 'en' ? 'Quick rebooking' : 'Schnelle Neubuchung'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                <span className="text-xs text-text-muted">
                  {language === 'en' ? 'Booking history' : 'Buchungshistorie'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                <span className="text-xs text-text-muted">
                  {language === 'en' ? 'Exclusive offers' : 'Exklusive Angebote'}
                </span>
              </div>
            </div>
          </div>

          {/* Right column - Auth form */}
          <div className="bg-[#3f3f3f] border border-white/10 px-5 py-6 rounded-lg">
            {/* Mode tabs */}
            <div className="flex mb-6 text-xs md:text-sm border-b border-white/20">
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`flex-1 px-3 py-3 uppercase tracking-[0.18em] transition-colors ${
                  mode === 'signup'
                    ? 'bg-brand-primary text-text-light border-b-2 border-accent-teal'
                    : 'bg-transparent text-text-muted hover:text-text-light'
                }`}
              >
                {language === 'en' ? 'Sign up' : 'Registrieren'}
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`flex-1 px-3 py-3 uppercase tracking-[0.18em] transition-colors ${
                  mode === 'login'
                    ? 'bg-brand-primary text-text-light border-b-2 border-accent-teal'
                    : 'bg-transparent text-text-muted hover:text-text-light'
                }`}
              >
                {language === 'en' ? 'Login' : 'Login'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted uppercase tracking-[0.18em] mb-1">
                    {language === 'en' ? 'Full Name' : 'Vollständiger Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full bg-black/40 border border-white/20 px-3 py-2.5 text-sm text-text-light outline-none focus:border-accent-teal rounded"
                    placeholder={language === 'en' ? 'John Doe' : 'Max Mustermann'}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em] mb-1">
                  {language === 'en' ? 'Email' : 'E-Mail'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value.trim().toLowerCase())
                  }
                  className="w-full bg-black/40 border border-white/20 px-3 py-2.5 text-sm text-text-light outline-none focus:border-accent-teal rounded"
                  placeholder={language === 'en' ? 'you@example.com' : 'sie@example.com'}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs text-text-muted uppercase tracking-[0.18em] mb-1">
                  {language === 'en' ? 'Password' : 'Passwort'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-black/40 border border-white/20 px-3 py-2.5 text-sm text-text-light outline-none focus:border-accent-teal rounded"
                  placeholder={
                    language === 'en' ? 'Minimum 8 characters' : 'Mindestens 8 Zeichen'
                  }
                  disabled={loading}
                />
                
                {/* Password strength indicator */}
                {password && mode === 'signup' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>{language === 'en' ? 'Password strength:' : 'Passwortstärke:'}</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-xs text-text-muted uppercase tracking-[0.18em] mb-1">
                    {language === 'en' ? 'Confirm Password' : 'Passwort bestätigen'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full bg-black/40 border border-white/20 px-3 py-2.5 text-sm text-text-light outline-none focus:border-accent-teal rounded"
                    placeholder={
                      language === 'en' ? 'Confirm your password' : 'Bestätigen Sie Ihr Passwort'
                    }
                    disabled={loading}
                  />
                </div>
              )}

              {/* Forgot password (Login only) */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs text-accent-teal hover:underline"
                    disabled={loading}
                  >
                    {language === 'en' ? 'Forgot password?' : 'Passwort vergessen?'}
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-brand-primary hover:bg-brand-dark text-text-light text-sm uppercase tracking-[0.18em] py-3 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? language === 'en'
                    ? 'Please wait...'
                    : 'Bitte warten...'
                  : mode === 'signup'
                  ? language === 'en'
                    ? 'Create account'
                    : 'Konto anlegen'
                  : language === 'en'
                  ? 'Login'
                  : 'Login'}
              </button>

              {/* Messages */}
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

              {/* Terms and Privacy (Signup only) */}
              {mode === 'signup' && (
                <p className="text-xs text-text-muted mt-4 text-center">
                  {language === 'en'
                    ? 'By creating an account, you agree to our Terms of Service and Privacy Policy'
                    : 'Mit der Kontoerstellung stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu'}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
