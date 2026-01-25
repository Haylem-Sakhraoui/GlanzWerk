import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-white/10 pb-8 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-glanzwerk.png"
                alt="CarCleaner logo"
                className="h-8 w-auto object-contain"
              />
              <p className="font-league text-xl text-text-light uppercase">CarCleaner</p>
            </div>
            <p className="text-xs md:text-sm text-text-muted">
              Premium car cleaning service in Germany. Online booking, fast turnaround, and pickup options.
            </p>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">Contact</p>
            <p>CarCleaner Workshop</p>
            <p>Musterstraße 12</p>
            <p>12345 Berlin, Deutschland</p>
            <p className="mt-1">Tel: +49 30 0000 0000</p>
            <p>E-Mail: hello@carcleaner.de</p>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">Business hours</p>
            <p>Mon–Fri: 08:00 – 19:00</p>
            <p>Sat: 09:00 – 16:00</p>
            <p>Sun: Closed</p>
          </div>
          <div className="space-y-3 text-xs md:text-sm text-text-muted">
            <p className="font-gothic text-text-light">Follow</p>
            <div className="flex gap-3">
              <Link href="#" className="hover:text-accent-teal">
                Instagram
              </Link>
              <Link href="#" className="hover:text-accent-teal">
                Facebook
              </Link>
              <Link href="#" className="hover:text-accent-teal">
                TikTok
              </Link>
            </div>
            <p className="font-gothic text-text-light pt-2">Offer</p>
            <p>
              For every 2 cleanings at our hub, get 50% off on the 3rd cleaning.
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <p>© {new Date().getFullYear()} CarCleaner. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-accent-teal">
              Imprint
            </Link>
            <Link href="#" className="hover:text-accent-teal">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
