'use client'

import { LanguageSwitcher, useLanguage } from './LanguageProvider'

export function TopOfferBar() {
  const { language } = useLanguage()

  const text =
    language === 'en'
      ? 'Offer: For every 2 cleanings at our hub, get 50% OFF on the 3rd cleaning.'
      : 'Angebot: Nach zwei Reinigungen in unserem Hub erhalten Sie 50% RABATT auf die dritte Reinigung.'

  return (
    <section className="bg-red-600 text-white text-xs md:text-sm">
      <div className="max-w-[1340px] mx-auto flex items-center justify-between gap-3 px-4 md:px-6 lg:px-8 py-2">
        <p className="font-gothic tracking-[0.18em] uppercase">{text}</p>
        <LanguageSwitcher />
      </div>
    </section>
  )
}

