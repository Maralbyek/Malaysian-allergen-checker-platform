"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { Monitor, Globe, Zap, Shield } from "lucide-react"

export function AppPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9])

  return (
    <section ref={ref} className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-foreground text-balance">
            A powerful web platform for safer dining
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Access AllergenSafe from any device with our responsive web application.
          </p>
        </motion.div>

        <div className="relative flex items-center justify-center" style={{ perspective: "2000px" }}>
          {/* Left browser - tablet view */}
          <motion.div
            initial={{ opacity: 0, x: -100, rotateY: 30 }}
            animate={isInView ? { opacity: 0.7, x: 0, rotateY: 15 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]) }}
            className="hidden lg:block absolute left-[5%] z-0"
          >
            <div className="w-72 bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="h-8 bg-muted flex items-center gap-2 px-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-2">
                  <div className="h-4 bg-background rounded-md px-2 flex items-center">
                    <span className="text-[8px] text-muted-foreground truncate">allergensafe.com/restaurants</span>
                  </div>
                </div>
              </div>
              <div className="aspect-[4/3]">
                <img
                  src="/web-app-restaurant-listing-page-with-cards-showing.jpg"
                  alt="Web app restaurant listing"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Center browser - main desktop view */}
          <motion.div style={{ y, rotateX, scale }} className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="w-full max-w-3xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Browser chrome */}
              <div className="h-10 bg-muted flex items-center gap-3 px-4 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-background rounded-lg px-3 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">allergensafe.com/dish/grilled-salmon</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded bg-background/50" />
                  <div className="w-6 h-6 rounded bg-background/50" />
                </div>
              </div>

              {/* Browser content */}
              <div className="relative aspect-[16/10] bg-secondary">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src="/modern-web-app-food-dish-detail-page-showing-grill.jpg"
                    alt="Web app dish details"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Floating allergen badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1, type: "spring" }}
                  className="absolute top-6 right-6 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg shadow-lg flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Contains Fish
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="absolute top-20 right-6 px-4 py-2 bg-accent text-accent-foreground text-sm rounded-lg shadow-lg"
                >
                  Dairy Free
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.4, type: "spring" }}
                  className="absolute bottom-6 left-6 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg shadow-lg"
                >
                  Safe for your profile
                </motion.div>
              </div>
            </motion.div>

            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-24 bg-foreground/5 blur-3xl rounded-full" />
          </motion.div>

          {/* Right browser - mobile responsive view */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotateY: -30 }}
            animate={isInView ? { opacity: 0.7, x: 0, rotateY: -15 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
            className="hidden lg:block absolute right-[5%] z-0"
          >
            <div className="w-56 bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="h-8 bg-muted flex items-center gap-2 px-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-2">
                  <div className="h-4 bg-background rounded-md px-2 flex items-center">
                    <span className="text-[8px] text-muted-foreground truncate">allergensafe.com/profile</span>
                  </div>
                </div>
              </div>
              <div className="aspect-[9/16]">
                <img
                  src="/web-app-user-profile-settings-page-with-allergy-se.jpg"
                  alt="Web app profile settings"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-4 lg:gap-8"
        >
          {[
            { icon: Globe, label: "Works on Any Browser" },
            { icon: Monitor, label: "Desktop & Mobile" },
            { icon: Zap, label: "Lightning Fast" },
            { icon: Shield, label: "Secure & Private" },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-4 py-2 bg-card rounded-full border border-border text-sm font-medium flex items-center gap-2"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              {feature.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
