import Image from 'next/image'

const instagramImages = [
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/sb-instagram-feed-images/590968098_841193372112771_7816399534739346675_nfull.webp',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/sb-instagram-feed-images/588720351_1201325325241052_3529954561210089601_nfull.webp',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/sb-instagram-feed-images/587269931_17917097625226587_466116285892758287_nfull.webp',
  'https://perfectcleandesign-erfurt.de/wp-content/uploads/sb-instagram-feed-images/589212570_2354817234954108_2125571790121778923_nfull.webp',
]

export function InstagramGrid() {
  return (
    <section className="max-w-[1340px] mx-auto py-12 px-4 md:px-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {instagramImages.map((src) => (
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
