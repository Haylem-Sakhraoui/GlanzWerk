'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseBrowser } from '../lib/supabaseClient'
import { useLanguage } from './LanguageProvider'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export function Navbar() {
  const { language } = useLanguage()
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const { data } = await supabaseBrowser.auth.getUser()
      if (!mounted) return
      if (data.user) {
        setAuthState('authenticated')
        setUserEmail(data.user.email ?? null)
        const { data: adminRow } = await supabaseBrowser
          .from('pcd_admins')
          .select('user_id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        if (!mounted) return
        setIsAdmin(Boolean(adminRow))
      } else {
        setAuthState('unauthenticated')
        setUserEmail(null)
        setIsAdmin(false)
      }
    }

    loadUser()

    const { data: subscription } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          setAuthState('authenticated')
          setUserEmail(session.user.email ?? null)
          supabaseBrowser
            .from('pcd_admins')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data: adminRow }) => {
              if (!mounted) return
              setIsAdmin(Boolean(adminRow))
            })
        } else {
          setAuthState('unauthenticated')
          setUserEmail(null)
          setIsAdmin(false)
        }
      },
    )

    return () => {
      mounted = false
      subscription?.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabaseBrowser.auth.signOut()
    setAuthState('unauthenticated')
    setUserEmail(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const labelBook = language === 'en' ? 'Book' : 'Buchen'
  const labelAccount = language === 'en' ? 'Account' : 'Konto'
  const labelServices = language === 'en' ? 'Services' : 'Leistungen'
  const labelPrices = language === 'en' ? 'Prices' : 'Preise'
  const labelContact = language === 'en' ? 'Contact' : 'Kontakt'
  const labelHome = language === 'en' ? 'Home' : 'Startseite'
  const labelMyAppointments =
    language === 'en' ? 'My appointments' : 'Meine Termine'
  const labelAdminDashboard =
    language === 'en' ? 'Admin dashboard' : 'Admin-Dashboard'
  const labelLogout = language === 'en' ? 'Logout' : 'Abmelden'
  const labelCta =
    language === 'en' ? 'Login / Sign up' : 'Login / Registrieren'
  const isDashboard = pathname.startsWith('/dashboard')
  const homePrefix = isDashboard ? '/' : ''

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a]/95 border-b border-white/10 backdrop-blur">
      <div className="max-w-[1340px] mx-auto flex items-center justify-between gap-4 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2">
          {authState === 'authenticated' && userEmail && (
            <span className="hidden sm:inline text-[11px] text-text-muted">
              {userEmail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-4 text-xs md:text-sm">
            <a
              href="/"
              className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
            >
              {labelHome}
            </a>
            <a
              href={`${homePrefix}#services`}
              className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
            >
              {labelServices}
            </a>
            <a
              href={`${homePrefix}#booking`}
              className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
            >
              {labelPrices}
            </a>
            <a
              href={`${homePrefix}#booking`}
              className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
            >
              {labelBook}
            </a>
            <a
              href={`${homePrefix}#auth`}
              className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
            >
              {labelAccount}
            </a>
            <a
              href={`${homePrefix}#contact`}
              className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
            >
              {labelContact}
            </a>
            {authState === 'authenticated' && (
              <>
                <a
                  href={isAdmin ? '/dashboard/admin' : '/dashboard'}
                  className="uppercase tracking-[0.18em] text-text-muted hover:text-text-light"
                >
                  {isAdmin ? labelAdminDashboard : labelMyAppointments}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-brand-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-light hover:bg-brand-dark"
                >
                  {labelLogout}
                </button>
              </>
            )}
            {authState === 'unauthenticated' && (
              <a
                href={`${homePrefix}#auth`}
                className="rounded bg-brand-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-light hover:bg-brand-dark"
              >
                {labelCta}
              </a>
            )}
          </nav>
          <button
            type="button"
            className="md:hidden inline-flex flex-col justify-center items-center w-8 h-8 border border-white/30 text-text-light"
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            <span className="block h-[1px] w-4 bg-white mb-1" />
            <span className="block h-[1px] w-4 bg-white mb-1" />
            <span className="block h-[1px] w-4 bg-white" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#111]">
          <div className="max-w-[1340px] mx-auto px-4 py-3 flex flex-col gap-2 text-xs">
            <a
              href="/"
              className="uppercase tracking-[0.18em] text-text-light"
              onClick={() => setMenuOpen(false)}
            >
              {labelHome}
            </a>
            <a
              href={`${homePrefix}#services`}
              className="uppercase tracking-[0.18em] text-text-light"
              onClick={() => setMenuOpen(false)}
            >
              {labelServices}
            </a>
            <a
              href={`${homePrefix}#booking`}
              className="uppercase tracking-[0.18em] text-text-light"
              onClick={() => setMenuOpen(false)}
            >
              {labelPrices}
            </a>
            <a
              href={`${homePrefix}#booking`}
              className="uppercase tracking-[0.18em] text-text-light"
              onClick={() => setMenuOpen(false)}
            >
              {labelBook}
            </a>
            <a
              href={`${homePrefix}#auth`}
              className="uppercase tracking-[0.18em] text-text-light"
              onClick={() => setMenuOpen(false)}
            >
              {labelAccount}
            </a>
            <a
              href={`${homePrefix}#contact`}
              className="uppercase tracking-[0.18em] text-text-light"
              onClick={() => setMenuOpen(false)}
            >
              {labelContact}
            </a>
            {authState === 'authenticated' && (
              <>
                <a
                  href={isAdmin ? '/dashboard/admin' : '/dashboard'}
                  className="uppercase tracking-[0.18em] text-text-light"
                  onClick={() => setMenuOpen(false)}
                >
                  {isAdmin ? labelAdminDashboard : labelMyAppointments}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 rounded bg-brand-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-light hover:bg-brand-dark"
                >
                  {labelLogout}
                </button>
              </>
            )}
            {authState === 'unauthenticated' && (
              <a
                href={`${homePrefix}#auth`}
                className="mt-1 rounded bg-brand-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-light hover:bg-brand-dark"
                onClick={() => setMenuOpen(false)}
              >
                {labelCta}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
