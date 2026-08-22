// components/home-hero-slider.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { heroSlides } from "@/data/hero-slides"
import Image from 'next/image'

export function HomeHeroSlider() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={heroSlides[index].image}
            alt={heroSlides[index].title}
            fill
            className="object-cover"
            priority
          />
          {/* Content Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl sm:text-4xl font-bold text-white mb-2"
            >
              {heroSlides[index].title}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-lg text-gray-200 max-w-xl"
            >
              {heroSlides[index].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="absolute bottom-6 right-8 flex space-x-2">
        {heroSlides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 transition-all duration-300 rounded-full ${i === index ? 'w-8 bg-(--primary-color)' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}