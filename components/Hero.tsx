'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from './LanguageProvider'

const heroPairs = [
  {
    id: 1,
    before: 'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/5.png',
    after: 'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/6.png',
  },
  {
    id: 2,
    before: 'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/3-2.png',
    after: 'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/9.png',
  },
]

export function Hero() {
  const { language } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % heroPairs.length)
    }, 3500)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const title =
    language === 'en' ? 'Premium car cleaning in Germany' : 'Premium Autoreinigung in Deutschland'

  const subTitle =
    language === 'en'
      ? 'Clean. Fast. Reliable. Premium finish in every detail.'
      : 'Sauber. Schnell. Zuverlässig. Premium-Finish bis ins Detail.'

  const description =
    language === 'en'
      ? 'Book your next interior and exterior cleaning in just a few clicks. Secure online booking, transparent pricing, and optional pickup and delivery service directly from your location.'
      : 'Buchen Sie Ihre nächste Innen- und Außenreinigung in nur wenigen Klicks. Sichere Online-Buchung, transparente Preise und optionaler Hol- und Bringservice direkt von Ihrem Standort.'

  const bookLabel = language === 'en' ? 'Book Your Cleaning' : 'Reinigung buchen'
  const accountLabel =
    language === 'en' ? 'Create Account / Login' : 'Konto anlegen / Login'
  const trustedTitle =
    language === 'en' ? 'Trusted by local drivers' : 'Vertraut von Fahrern vor Ort'
  const trustedText =
    language === 'en'
      ? 'Top Google ratings from car owners in your area.'
      : 'Top-Google-Bewertungen von Autobesitzern in Ihrer Region.'
  const offerTitle = language === 'en' ? 'Offer' : 'Angebot'
  const offerText =
    language === 'en'
      ? 'Every 3rd cleaning at our hub is 50% off.'
      : 'Jede 3. Reinigung in unserem Hub ist 50% günstiger.'

  const activePair = heroPairs[activeIndex]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-bg to-neutral-bg">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-28 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <p className="text-accent-teal font-gothic tracking-[0.25em] text-xs md:text-sm uppercase">
            CarCleaner • Premium Car Care
          </p>
          <h1 className="font-league text-[40px] md:text-[56px] lg:text-[64px] leading-[1.05] uppercase text-text-light">
            {title}
          </h1>
          <h2 className="font-gothic text-lg md:text-xl text-text-muted">
            {subTitle}
          </h2>
          <p className="text-sm md:text-base text-text-muted max-w-xl">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="#booking"
              className="inline-flex items-center justify-center rounded-none bg-brand-primary px-8 py-3 text-base md:text-lg font-league uppercase tracking-wide text-text-light transition-colors hover:bg-brand-dark"
            >
              {bookLabel}
            </Link>
            <Link
              href="#auth"
              className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm md:text-base font-secondary tracking-wide text-text-light hover:bg-white/5"
            >
              {accountLabel}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-text-muted pt-4">
            <div>
              <p className="font-gothic text-text-light">{trustedTitle}</p>
              <p>{trustedText}</p>
            </div>
            <div>
              <p className="font-gothic text-text-light">{offerTitle}</p>
              <p>{offerText}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full max-w-xl">
          <div className="relative w-full aspect-[4/3] rounded-none overflow-hidden border border-white/15">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent z-10" />
            <div className="relative w-full h-full flex">
              <div className="relative w-1/2 h-full overflow-hidden group">
                <img
                  src={activePair.before}
                  alt="Before car cleaning"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end justify-between p-4 text-xs md:text-sm text-text-light">
                  <span className="font-gothic uppercase">
                    {language === 'en' ? 'Before' : 'Vorher'}
                  </span>
                  <span className="bg-white/15 px-2 py-1">
                    {language === 'en' ? 'Before' : 'Vorher'}
                  </span>
                </div>
              </div>
              <div className="relative w-1/2 h-full overflow-hidden group">
                <img
                  src={activePair.after}
                  alt="After car cleaning"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end justify-between p-4 text-xs md:text-sm text-text-light">
                  <span className="font-gothic uppercase">
                    {language === 'en' ? 'After' : 'Nachher'}
                  </span>
                  <span className="bg-white/15 px-2 py-1">
                    {language === 'en' ? 'After' : 'Nachher'}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-xs md:text-sm text-text-light">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
              <span>
                {language === 'en'
                  ? 'Live finish – real CarCleaner results'
                  : 'Live Finish – echte CarCleaner-Ergebnisse'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
