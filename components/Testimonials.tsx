interface TestimonialsProps {
  language: 'en' | 'de'
}

const testimonials = [
  {
    name: 'Maximilian S.',
    city: 'Berlin',
    rating: 5,
    textEn: 'Super fast and professional. My SUV looks like new again.',
    textDe: 'Sehr schnell und professionell. Mein SUV sieht wieder wie neu aus.',
  },
  {
    name: 'Laura K.',
    city: 'Hamburg',
    rating: 5,
    textEn: 'Easy online booking and pickup from my office. Highly recommended.',
    textDe: 'Einfache Online-Buchung und Abholung direkt vom Büro. Sehr empfehlenswert.',
  },
  {
    name: 'Tobias R.',
    city: 'München',
    rating: 4,
    textEn: 'Top interior detailing, every corner was spotless.',
    textDe: 'Top Innenreinigung, jede Ecke war sauber.',
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

// Fix the function signature - you're returning JSX, not TestimonialsProps
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
      ? '4.8/5 average rating across all locations.'
      : 'Durchschnittlich 4,8/5 Sterne über alle Standorte.'

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
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between bg-neutral-bg border border-white/10 px-5 py-6"
            >
              <div className="space-y-3">
                <Stars count={item.rating} />
                <p className="text-sm text-text-light leading-relaxed">
                  {language === 'en' ? item.textEn : item.textDe}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                <span>{item.name}</span>
                <span>{item.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}