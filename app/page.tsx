import { LanguageProvider } from '../components/LanguageProvider'
import { TopOfferBar } from '../components/TopOfferBar'
import { Hero } from '../components/Hero'
import { AuthPanel } from '../components/AuthPanel'
import { BookingSection } from '../components/BookingSection'
import { ServicesGrid } from '../components/ServicesGrid'
import { Testimonials } from '../components/Testimonials'
import { Footer } from '../components/Footer'
import { TestimonialsWrapper } from '../components/TestimonialsWrapper'
import { ServicesGridWrapper } from '../components/ServiceGridWrapper'
import { Navbar } from '../components/Navbar'

export default function HomePage() {
  return (
    <LanguageProvider>
      <TopOfferBar />
      <Navbar />
      <div className="w-full bg-black border-b border-white/10">
        <img
          src="/logo.png"
          alt="CarCleaner logo"
          className="w-full h-auto object-contain"
        />
      </div>
      <Hero />
      <AuthPanel />
      <BookingSection />
      <ServicesGridWrapper />
      <TestimonialsWrapper/>
      <Footer />
    </LanguageProvider>
  )
}
