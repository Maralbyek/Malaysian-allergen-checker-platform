"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Finally, I can dine out without anxiety. Knowing exactly what's in my food has been life-changing for managing my celiac disease.",
    author: "Sarah Mitchell",
    role: "Celiac Disease",
    avatar: "/professional-woman-portrait-headshot-warm-lighting.jpg",
    rating: 5,
  },
  {
    quote:
      "As a parent of a child with severe nut allergies, this app gives me peace of mind. The verified restaurant data is incredibly accurate.",
    author: "Michael Chen",
    role: "Parent of a child with allergies",
    avatar: "/professional-asian-man-portrait-headshot-natural-l.jpg",
    rating: 5,
  },
  {
    quote:
      "I've discovered so many new restaurants I never knew were safe for my dairy intolerance. The community reviews are invaluable.",
    author: "Emma Rodriguez",
    role: "Lactose Intolerant",
    avatar: "/professional-latina-woman-portrait-headshot-studio.jpg",
    rating: 5,
  },
  {
    quote:
      "The real-time menu updates are a game changer. I no longer have to call ahead to confirm ingredients. This app saved my life, literally.",
    author: "James Wilson",
    role: "Multiple Food Allergies",
    avatar: "/professional-man-portrait-headshot-outdoor-setting.jpg",
    rating: 5,
  },
]

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => (prev + newDirection + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" ref={ref} className="py-20 lg:py-32 bg-secondary/50 relative overflow-hidden">
      <Quote className="absolute top-20 left-10 w-24 h-24 text-accent/10 rotate-180" />
      <Quote className="absolute bottom-20 right-10 w-24 h-24 text-accent/10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-foreground text-balance">
            Trusted by thousands of users
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            See what people with food allergies are saying about their experience.
          </p>
        </motion.div>

        <div className="relative h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.4 },
              }}
              className="absolute w-full max-w-2xl"
            >
              <div className="p-8 lg:p-12 bg-card rounded-3xl border border-border shadow-xl relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute -inset-px rounded-3xl bg-gradient-to-r from-accent via-primary to-accent opacity-20 blur-sm -z-10"
                />

                <div className="flex gap-1 mb-6 justify-center">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-accent text-accent" />
                    </motion.div>
                  ))}
                </div>

                <blockquote className="text-xl lg:text-2xl text-foreground leading-relaxed text-center font-serif">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex items-center justify-center gap-4"
                >
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                    alt={testimonials[currentIndex].author}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-accent/20"
                  />
                  <div className="text-left">
                    <div className="font-medium text-foreground">{testimonials[currentIndex].author}</div>
                    <div className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 lg:-left-16 p-3 rounded-full bg-card border border-border hover:bg-secondary transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 lg:-right-16 p-3 rounded-full bg-card border border-border hover:bg-secondary transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className="relative p-1"
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-accent" : "bg-border"}`}
              />
              {index === currentIndex && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute inset-0 border-2 border-accent rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
