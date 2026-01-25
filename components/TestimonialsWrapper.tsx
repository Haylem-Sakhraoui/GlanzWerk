"use client"

import { useLanguage } from './LanguageProvider'
import { Testimonials } from './Testimonials'

export function TestimonialsWrapper() {
  const { language } = useLanguage()
  
  // Pass language as prop to the server component
  return <Testimonials language={language} />
}