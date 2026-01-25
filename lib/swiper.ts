import type { SwiperOptions } from 'swiper/types'

export const mediaCarouselConfig: SwiperOptions = {
  slidesPerView: 2,
  spaceBetween: 22,
  loop: true,
  autoplay: {
    delay: 3000,
  },
  pagination: {
    clickable: true,
  },
  breakpoints: {
    640: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 5,
    },
  },
}

