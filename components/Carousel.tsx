'use client'

import { useEffect, useRef } from 'react'
import Swiper from 'swiper'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { mediaCarouselConfig } from '../lib/swiper'

const carouselImages = [
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/5.png',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/6.png',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/3-2.png',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/9.png',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/09/8.png',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/08/Autoinnenraum-pcd-little-2-scaled.png',
]

Swiper.use([Autoplay, Pagination])

export function Carousel() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const paginationEl = containerRef.current.querySelector<HTMLElement>('.swiper-pagination')

    const swiper = new Swiper(containerRef.current, {
      ...mediaCarouselConfig,
      pagination: {
        el: paginationEl ?? undefined,
        clickable: true,
      },
    })

    return () => {
      swiper.destroy(true, true)
    }
  }, [])

  return (
    <section className="max-w-[1520px] mx-auto py-12 px-4 md:px-0">
      <div ref={containerRef} className="swiper media-carousel h-[220px]">
        <div className="swiper-wrapper">
          {carouselImages.map((src) => (
            <div key={src} className="swiper-slide">
              <img src={src} alt="Carousel item" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="swiper-pagination" />
      </div>
    </section>
  )
}
