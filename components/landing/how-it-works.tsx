"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const steps = [
  {
    number: "1",
    title: "Set Your Allergies",
    description:
      "Create your profile and list all your food allergies and sensitivities. We support all 14 major allergens.",
    image: "/web-dashboard-user-profile-page-with-allergy-selec.jpg",
  },
  {
    number: "2",
    title: "Browse Restaurants",
    description:
      "Search for restaurants, hotels, or vendors in your area. View their menus with detailed allergen information.",
    image: "/web-app-restaurant-discovery-page-with-search-bar-.jpg",
  },
  {
    number: "3",
    title: "Check Dish Details",
    description:
      "View every ingredient and allergen in each dish. Get clear warnings for items that contain your allergens.",
    image: "/web-app-food-menu-page-showing-dish-cards-with-ing.jpg",
  },
]

function StepCard({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0]
  index: number
  isInView: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 1])
  const x = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -100 : 100, 0])

  return (
    <motion.div
      ref={cardRef}
      style={{ scale, opacity, x }}
      className={`flex flex-col gap-8 lg:gap-16 items-center ${
        index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      <div className="flex-1 lg:max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-serif text-2xl font-medium mb-6 relative"
        >
          {step.number}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="absolute inset-0 bg-primary rounded-2xl"
          />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.2 + 0.1 }}
          className="font-serif text-2xl lg:text-3xl font-medium text-foreground"
        >
          {step.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.2 + 0.2 }}
          className="mt-4 text-muted-foreground text-lg leading-relaxed"
        >
          {step.description}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: index % 2 === 0 ? -15 : 15 }}
        animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
        transition={{ delay: index * 0.2 + 0.3, duration: 0.6 }}
        whileHover={{ scale: 1.02, rotateY: index % 2 === 0 ? 5 : -5 }}
        className="flex-1 w-full lg:max-w-xl"
        style={{ perspective: "1000px" }}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary group">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            src={step.image || "/placeholder.svg"}
            alt={step.title}
            className="w-full h-full object-cover"
          />

          {/* Shine effect on hover */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            whileHover={{ x: "200%", opacity: 0.3 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
          />

          {/* Step badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
            className="absolute top-4 left-4 px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-sm font-medium shadow-lg"
          >
            Step {step.number}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" ref={ref} className="py-20 lg:py-32 relative overflow-hidden">
      {/* Animated connection line */}
      <div className="absolute left-1/2 top-40 bottom-40 w-px bg-gradient-to-b from-transparent via-border to-transparent hidden lg:block">
        <motion.div
          animate={{ y: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-0 w-full h-20 bg-gradient-to-b from-accent to-transparent"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16 lg:mb-24"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8 max-w-xs"
          />

          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-foreground text-balance">
            A safer dining experience in three simple steps
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Getting started takes less than a minute. Start making safer dining choices today.
          </p>
        </motion.div>

        <div className="space-y-16 lg:space-y-32">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  )
}
