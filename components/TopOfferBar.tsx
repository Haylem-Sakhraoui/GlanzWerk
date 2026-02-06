'use client'

import { LanguageSwitcher, useLanguage } from './LanguageProvider'

export function TopOfferBar() {
  const { language } = useLanguage()

  const text =
    language === 'en'
      ? 'Offer: For every 2 cleanings at our hub, get 50% OFF on the 3rd cleaning.'
      : 'Angebot: Nach zwei Reinigungen in unserem Hub erhalten Sie 50% RABATT auf die dritte Reinigung.'

  return (
    <section className="bg-red-600 text-white text-[10px] sm:text-xs md:text-sm">
      <div className="max-w-[1340px] mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-4 md:px-6 lg:px-8 py-2">
        <p className="font-gothic tracking-[0.16em] uppercase flex-1 min-w-[200px]">
          {text}
        </p>
        <div className="flex-shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    </section>
  )
}
