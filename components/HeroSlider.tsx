import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export interface Slide {
  id: string
  title: string
  subtitle: string
  bgFrom: string
  bgTo: string
  image?: string
  link: string
  buttonText?: string
  link2?: string
  buttonText2?: string
}

interface HeroSliderProps {
  slides: Slide[]
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current) return
      setIsAnimating(true)
      setCurrent(index)
      setTimeout(() => setIsAnimating(false), 600)
    },
    [current, isAnimating]
  )

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  if (!slides.length) return null

  const slide = slides[current]

  return (
    <div className="relative h-[540px] md:h-[620px] overflow-hidden">
      {/* Background */}
      <div
        key={slide.id}
        className="absolute inset-0 transition-opacity duration-700"
        style={
          slide.image
            ? { backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)` }
        }
      >
        {!slide.image && (
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 0),
                radial-gradient(circle at 75% 75%, white 1px, transparent 0)`,
              backgroundSize: '48px 48px',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Gold accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500" />

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
          <div className="max-w-2xl">
            <div key={`content-${slide.id}`} className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-5">
                <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-white/90 text-sm font-medium">โรงเรียนราชสีมาวิทยาลัย</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
                {slide.title}
              </h1>
              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-xl drop-shadow-sm">
                {slide.subtitle}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={slide.link}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 shadow-lg shadow-black/20"
                >
                  {slide.buttonText || 'เรียนรู้เพิ่มเติม'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {(slide.buttonText2 || slide.link2) && (
                  <Link
                    href={slide.link2 || '/admissions'}
                    className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/35 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-150 backdrop-blur-sm"
                  >
                    {slide.buttonText2 || 'สมัครเรียน'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow nav */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="สไลด์ก่อนหน้า"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="สไลด์ถัดไป"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-8 h-2.5 bg-gold-400' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`สไลด์ที่ ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6 text-white/50 text-sm font-medium">
        {current + 1} / {slides.length}
      </div>
    </div>
  )
}
