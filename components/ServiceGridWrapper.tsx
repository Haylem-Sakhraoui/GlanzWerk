"use client"

import { useLanguage } from './LanguageProvider'
import { ServicesGrid } from './ServicesGrid'

export function ServicesGridWrapper() {
  const { language } = useLanguage()
  
  return <ServicesGrid language={language} />
}