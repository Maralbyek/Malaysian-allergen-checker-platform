"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Search, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const floatingItems = [
  { emoji: "🥜", x: "10%", y: "20%", delay: 0 },
  { emoji: "🥛", x: "85%", y: "15%", delay: 0.5 },
  { emoji: "🌾", x: "75%", y: "70%", delay: 1 },
  { emoji: "🥚", x: "15%", y: "75%", delay: 1.5 },
  { emoji: "🦐", x: "90%", y: "45%", delay: 2 },
  { emoji: "🍞", x: "5%", y: "50%", delay: 2.5 },
]

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 z-0">
        <motion.div style={{ scale }} className="absolute inset-0 bg-cover bg-center bg-no-repeat">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/elegant-restaurant-kitchen-chef-preparing-healthy-.jpg')`,
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-foreground/60" />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      {floatingItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl z-20 pointer-events-none opacity-60"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1, 0.8],
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5,
            delay: item.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Content with parallax */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-md border border-card/20 text-card text-sm mb-8 shadow-lg shadow-accent/10"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <ShieldCheck className="w-4 h-4 text-accent" />
            </motion.div>
            <span>Trusted by 50,000+ users with food allergies</span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-card leading-tight text-balance"
            >
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                Dine with confidence.
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-card/80"
              >
                Know every ingredient.
              </motion.span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl text-card/80 max-w-2xl mx-auto text-pretty"
          >
            Browse restaurants, view detailed allergen information, and make informed dining decisions. Your safety is
            our priority.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent/50 rounded-full blur opacity-0 group-hover:opacity-70 transition duration-500" />
              <Button
                size="lg"
                className="relative rounded-full px-8 py-6 text-base bg-card text-foreground hover:bg-card/90"
                asChild
              >
                <Link href="/browse">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Restaurants
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base bg-transparent border-card/40 text-card hover:bg-card/10 group"
                asChild
              >
                <Link href="#how-it-works">
                  Learn More
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="relative w-6 h-10 rounded-full border-2 border-card/40 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
              height: ["8px", "16px", "8px"],
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-1 bg-card/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
