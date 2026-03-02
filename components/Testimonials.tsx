'use client'

interface TestimonialsProps {
  language: 'en' | 'de'
}

const fallbackTestimonials = [
  {
    name: 'Mariam Al-Hijawi',
    city: 'Erfurt',
    rating: 5,
    textEn: 'Excellent work, very good reception from the employer, and quick and efficient execution. I am very satisfied and I highly recommend this company!',
    textDe: 'Hervorragende Arbeit, sehr guter Umgang durch den Arbeitgeber und schnelle, effiziente Erledigung. Ich bin sehr zufrieden und kann das Unternehmen nur weiterempfehlen!',
  },
  {
    name: 'Omar Ali',
    city: 'Erfurt',
    rating: 5,
    textEn: 'A comforting verse, God willing… May God provide for your needs and open the doors of His abundant grace to you.',
    textDe: 'Ein tröstlicher Vers, so Gott will… Möge Gott für deine Bedürfnisse sorgen und dir die Türen seiner überreichen Gnade öffnen.',
  },
  {
    name: 'Malak Ahmad',
    city: 'Erfurt',
    rating: 5,
    textEn: 'Good job ...great service',
    textDe: 'Gute Arbeit ...toller Service',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-accent-teal">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < count ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

export function Testimonials({ language }: TestimonialsProps): JSX.Element {
  const title =
    language === 'en' ? 'What drivers say' : 'Was Fahrer sagen'
  const subtitle =
    language === 'en'
      ? 'Real feedback from CarCleaner customers near you. Integrated with Google reviews for live ratings.'
      : 'Echtes Feedback von CarCleaner-Kunden in Ihrer Nähe. Integriert mit Google-Bewertungen für Live-Ratings.'
  const googleLabel =
    language === 'en' ? 'Google Reviews' : 'Google-Bewertungen'
  const googleText =
    language === 'en'
      ? 'See all reviews on Google.'
      : 'Alle Bewertungen bei Google ansehen.'
  const googleLink =
    'https://www.google.com/maps/place/T%26A+fahrzeugaufbereitung/@51.1583557,9.6146429,128525m/data=!3m1!1e3!4m12!1m2!2m1!1sT%26A+fahrzeugaufbereitung!3m8!1s0x47a46de365677961:0xdf810e695895aa80!8m2!3d51.0083973!4d11.0327986!9m1!1b1!15sChhUJkEgZmFocnpldWdhdWZiZXJlaXR1bmeSAQhjYXJfd2FzaOABAA!16s%2Fg%2F11z03vr7th?hl=fr&entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D'
  const items = fallbackTestimonials.map((item) => ({
    name: item.name,
    rating: item.rating,
    text: language === 'en' ? item.textEn : item.textDe,
    relativeTime: item.city,
  }))

  return (
    <section className="bg-[#2f2f2f]">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="font-league text-[32px] md:text-[40px] uppercase text-text-light">
              {title}
            </h2>
            <p className="text-text-muted text-sm md:text-base max-w-xl">
              {subtitle}
            </p>
          </div>
          <div className="text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">{googleLabel}</p>
            <p>{googleText}</p>
            <a
              href={googleLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-2 text-[11px] uppercase tracking-[0.16em] text-accent-teal hover:text-text-light"
            >
              {language === 'en' ? 'Open Google reviews' : 'Google-Bewertungen öffnen'}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={`${item.name}-${item.text.slice(0, 32)}`}
              className="flex flex-col justify-between bg-neutral-bg border border-white/10 px-5 py-6"
            >
              <div className="space-y-3">
                <Stars count={item.rating} />
                <p className="text-sm text-text-light leading-relaxed">
                  {item.text}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                <span>{item.name}</span>
                <span>{item.relativeTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
