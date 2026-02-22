'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabaseBrowser } from '../lib/supabaseClient'

export function InstagramGrid() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    async function loadImages() {
      const { data, error } = await supabaseBrowser.storage.from('videos').list('', {
        limit: 8,
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

  return (
    <section className="max-w-[1340px] mx-auto py-12 px-4 md:px-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {images.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden">
            <Image src={src} alt="Instagram item" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 448 512" aria-hidden="true">
                <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
