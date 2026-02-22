import { Hero } from '../components/Hero'
import { AuthPanel } from '../components/AuthPanel'
import { BookingSection } from '../components/BookingSection'
import { Footer } from '../components/Footer'
import { TestimonialsWrapper } from '../components/TestimonialsWrapper'
import { ServicesGridWrapper } from '../components/ServiceGridWrapper'
import { InstagramGrid } from '../components/InstagramGrid'
import { Carousel } from '../components/Carousel'

export default function HomePage() {
  return (
    <>
      <div className="w-full bg-black border-b border-white/10">
        <img
          src="/logo.png"
          alt="CarCleaner logo"
          className="w-full h-auto object-contain"
        />
      </div>
      <Hero />
      <Carousel/>
      <AuthPanel />
      <BookingSection />
      <ServicesGridWrapper />
      <TestimonialsWrapper />
      <Footer />
    </>
  )
}
