'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer id="contact" className="bg-black">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-white/10 pb-8 mb-6">
          <div className="space-y-3">
            <p className="text-xs md:text-sm text-text-muted">
              {language === 'en'
                ? 'Premium car cleaning service in Germany. Online booking, fast turnaround, and pickup options.'
                : 'Premium-Autoreinigung in Deutschland. Online-Buchung, schnelle Bearbeitung und Hol- und Bringservice.'}
            </p>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">
              {language === 'en' ? 'Contact' : 'Kontakt'}
            </p>
            <p>T&A</p>
            <p>Stotternheimer Str 8</p>
            <p>99086 Erfurt, Deutschland</p>
            <div className="pt-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d192.05505316790604!2d11.032947225520509!3d51.008504302701425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a46de365677961%3A0xdf810e695895aa80!2sT%26A%20fahrzeugaufbereitung!5e0!3m2!1sfr!2sus!4v1771718930122!5m2!1sfr!2sus"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-32 rounded border border-white/10"
                title="T&A map"
              />
            </div>
            <p className="mt-1">
              {language === 'en' ? 'Tel:' : 'Tel.'} +49 15212005668
            </p>
            <p>E-Mail: info@fahrzeugaufbereitung-ta.de</p>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">
              {language === 'en' ? 'Business hours' : 'Öffnungszeiten'}
            </p>
            <p>
              {language === 'en' ? 'Mon–Fri:' : 'Mo–Fr:'} 09:00 – 19:00
            </p>
            <p>
              {language === 'en' ? 'Sat:' : 'Sa:'} 09:00 – 16:00
            </p>
            <p>{language === 'en' ? 'Sun: Closed' : 'So: Geschlossen'}</p>
          </div>
          <div className="space-y-3 text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">
              {language === 'en' ? 'Follow' : 'Folgen'}
            </p>
            <div className="flex gap-3">
              <Link href="#" className="hover:text-accent-teal">
                Instagram
              </Link>
              <Link href="#" className="hover:text-accent-teal">
                Facebook
              </Link>
              <Link href="#" className="hover:text-accent-teal">
                TikTok
              </Link>
            </div>
            <p className="font-gothic text-text-light pt-2">
              {language === 'en' ? 'Offer' : 'Angebot'}
            </p>
            <p>
              {language === 'en'
                ? 'For every 2 cleanings at our hub, get 50% off on the 3rd cleaning.'
                : 'Nach zwei Reinigungen in unserem Hub erhalten Sie 50 % Rabatt auf die dritte Reinigung.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <p>
            © {new Date().getFullYear()} T&A.{' '}
            {language === 'en'
              ? 'All rights reserved.'
              : 'Alle Rechte vorbehalten.'}
          </p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-accent-teal">
              {language === 'en' ? 'Imprint' : 'Impressum'}
            </Link>
            <Link href="#" className="hover:text-accent-teal">
              {language === 'en' ? 'Privacy' : 'Datenschutz'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
