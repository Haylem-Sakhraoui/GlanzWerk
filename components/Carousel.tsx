'use client'

import { useEffect, useRef, useState } from 'react'
import Swiper from 'swiper'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { mediaCarouselConfig } from '../lib/swiper'
import { supabaseBrowser } from '../lib/supabaseClient'

Swiper.use([Autoplay, Pagination])

export function Carousel() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    async function loadImages() {
      const { data, error } = await supabaseBrowser.storage.from('videos').list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      })

      if (!mounted) return

      if (error) {
        setImages([])
        return
      }

      const urls = (data ?? [])
        .filter((item) => !item.name.endsWith('/'))
        .map((item) => supabaseBrowser.storage.from('videos').getPublicUrl(item.name).data.publicUrl)
        .filter(Boolean)

      setImages(urls)
    }

    loadImages()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || images.length === 0) return

    const paginationEl = containerRef.current.querySelector<HTMLElement>('.swiper-pagination')
    const autoplayConfig =
      typeof mediaCarouselConfig.autoplay === 'object' ? mediaCarouselConfig.autoplay : {}

    const swiper = new Swiper(containerRef.current, {
      ...mediaCarouselConfig,
      autoplay: {
        ...autoplayConfig,
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: paginationEl ?? undefined,
        clickable: true,
      },
    })

    return () => {
      swiper.destroy(true, true)
    }
  }, [images.length])

  return (
    <section className="max-w-[1520px] mx-auto py-12 px-4 md:px-0">
      <div ref={containerRef} className="swiper media-carousel h-[220px]">
        <div className="swiper-wrapper">
          {images.map((src) => (
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
