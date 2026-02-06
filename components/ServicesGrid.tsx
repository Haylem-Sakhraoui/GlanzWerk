interface ServicesGridProps {
  language: 'en' | 'de'
}
const services = [
  {
    titleEn: 'Interior Deep Cleaning',
    titleDe: 'Innenraumreinigung',
    descriptionEn: 'Steam, vacuum and detail for seats, carpets, plastics and leather.',
    descriptionDe: 'Gründliche Reinigung von Sitzen, Teppichen, Kunststoff- und Lederflächen.',
    badge: 'Best for families',
  },
  {
    titleEn: 'Exterior Wash & Protection',
    titleDe: 'Außenwäsche & Schutz',
    descriptionEn: 'Gentle hand wash, rim cleaning and paint-safe drying.',
    descriptionDe: 'Schonende Handwäsche, Felgenreinigung und lackschonendes Trocknen.',
    badge: 'Paint safe',
  },
  {
    titleEn: 'Detailing & Finish',
    titleDe: 'Aufbereitung & Finish',
    descriptionEn: 'Machine polish, high-gloss finish and long-lasting protection.',
    descriptionDe: 'Maschinelle Politur, Hochglanzfinish und langanhaltender Schutz.',
    badge: 'Premium',
  },
  {
    titleEn: 'Eco Cleaning',
    titleDe: 'Eco-Reinigung',
    descriptionEn: 'Water-saving, eco-friendly products for a green clean.',
    descriptionDe: 'Wasserarme Reinigung mit umweltfreundlichen Produkten.',
    badge: 'Eco',
  },
]

export function ServicesGrid({ language }: ServicesGridProps): JSX.Element{

  const heading =
    language === 'en' ? 'Services for every car' : 'Services für jedes Fahrzeug'
  const intro =
    language === 'en'
      ? 'From a quick exterior wash to full interior detailing and eco-cleaning, CarCleaner adapts to your car and your schedule.'
      : 'Von der schnellen Außenwäsche bis zur kompletten Innenaufbereitung und Eco-Reinigung – CarCleaner passt sich Ihrem Fahrzeug und Ihrem Zeitplan an.'
  const pickupTitle =
    language === 'en' ? 'Pickup & Delivery Service' : 'Hol- und Bringservice'
  const pickupText =
    language === 'en'
      ? 'We collect your car directly from your address and bring it back shiny and clean.'
      : 'Wir holen Ihr Fahrzeug direkt bei Ihnen ab und bringen es glänzend sauber zurück.'
  const bookFast =
    language === 'en' ? 'Book in under 60 seconds' : 'In unter 60 Sekunden buchen'
  const pickupAvailable =
    language === 'en' ? 'Pickup available' : 'Abholung verfügbar'

  return (
    <section id="services" className="bg-neutral-bg">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="font-league text-[32px] md:text-[40px] uppercase text-text-light">
              {heading}
            </h2>
            <p className="text-text-muted text-sm md:text-base max-w-xl">
              {intro}
            </p>
          </div>
          <div className="text-xs md:text-sm text-text-muted max-w-sm">
            <p className="font-gothic text-text-light">{pickupTitle}</p>
            <p>{pickupText}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service) => (
            <div
              key={service.titleEn}
              className="relative flex flex-col justify-between bg-[#3f3f3f] border border-white/10 px-5 py-6 transition-transform duration-300 hover:-translate-y-1 hover:border-accent-teal/80"
            >
              <div className="space-y-3">
                <span className="inline-block bg-accent-teal/15 text-accent-teal text-[10px] uppercase tracking-[0.2em] px-3 py-1">
                  {service.badge}
                </span>
                <h3 className="font-gothic text-xl text-text-light">
                  {language === 'en' ? service.titleEn : service.titleDe}
                </h3>
                <p className="text-xs md:text-sm text-text-muted leading-relaxed">
                  {language === 'en' ? service.descriptionEn : service.descriptionDe}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-text-muted">
                <span>{bookFast}</span>
                <span className="text-accent-teal">{pickupAvailable}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
