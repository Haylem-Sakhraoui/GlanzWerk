import Image from 'next/image'

export function AboutUs() {
  return (
    <section className="bg-neutral-bg">
      <div className="max-w-[1340px] mx-auto py-[105.6px] px-4 md:px-0">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex flex-row gap-5 justify-center lg:w-1/2">
            <div className="flex flex-col justify-center">
              <Image
                src="https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/10/2.png"
                alt="Grey Mercedes"
                width={302}
                height={348}
                className="w-[302px] h-[348px] object-cover border border-white/20"
              />
            </div>
            <div className="flex flex-col gap-5">
              <Image
                src="https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/10/3.png"
                alt="VW Tiguan"
                width={181}
                height={209}
                className="w-[181px] h-[209px] object-cover border border-white/20"
              />
              <Image
                src="https://perfectcleandesign-erfurt.de/wp-content/uploads/2025/10/1.png"
                alt="White Mercedes"
                width={302}
                height={348}
                className="w-[302px] h-[348px] object-cover border border-white/20"
              />
            </div>
          </div>

          <div className="lg:w-1/2 space-y-6">
            <h5 className="font-gothic text-accent-teal text-2xl font-medium uppercase tracking-wider">ABOUT US</h5>
            <h2 className="font-league text-text-light text-[56px] font-extralight leading-[1.2] uppercase">
              Welcome to your car care expert.
            </h2>
            <p className="text-text-muted text-[17.6px] font-medium leading-[1.4] max-w-xl">
              We are dedicated to providing the perfect care for your vehicle. With passion, experience, and meticulous
              attention to detail, we ensure your car is not only clean but also shines like new. Whether it&apos;s a thorough
              interior cleaning, a brilliant paint finish, or a comprehensive vehicle detailing – we combine top quality with
              genuine craftsmanship. Trust in our expertise and experience car care that truly impresses.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-brand-primary text-text-light font-league text-[26px] font-extralight uppercase px-8 py-4 transition-colors hover:bg-brand-dark"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 192 512" aria-hidden="true">
                <path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z" />
              </svg>
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

