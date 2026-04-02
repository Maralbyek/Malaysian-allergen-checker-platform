"use client"

import { motion } from "framer-motion"

const partners = [
  "Whole Foods",
  "Chipotle",
  "Sweetgreen",
  "Panera Bread",
  "Shake Shack",
  "Blue Apron",
  "HelloFresh",
  "DoorDash",
  "Uber Eats",
  "Grubhub",
  "OpenTable",
  "Yelp",
]

export function Marquee() {
  return (
    <section className="py-12 bg-primary/5 overflow-hidden border-y border-border">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="flex gap-12 items-center whitespace-nowrap"
        >
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {partner.charAt(0)}
              </div>
              <span className="text-lg font-medium">{partner}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative mt-6">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="flex gap-12 items-center whitespace-nowrap"
        >
          {[...partners.reverse(), ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {partner.charAt(0)}
              </div>
              <span className="text-lg font-medium">{partner}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
