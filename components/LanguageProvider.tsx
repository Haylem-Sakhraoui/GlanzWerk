'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'en' | 'de'

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('carcleaner-language')
    if (stored === 'en' || stored === 'de') {
      setLanguageState(stored)
    }
  }, [])

  function setLanguage(next: Language) {
    setLanguageState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('carcleaner-language', next)
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="inline-flex rounded-full border border-white/30 bg-black/40 text-[11px] md:text-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 uppercase tracking-[0.16em] ${
          language === 'en' ? 'bg-white text-black' : 'text-text-light'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('de')}
        className={`px-3 py-1.5 uppercase tracking-[0.16em] ${
          language === 'de' ? 'bg-white text-black' : 'text-text-light'
        }`}
      >
        DE
      </button>
    </div>
  )
}

