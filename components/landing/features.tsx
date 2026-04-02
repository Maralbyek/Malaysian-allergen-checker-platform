"use client"

import type React from "react"

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { Shield, Search, Bell, Users, Leaf, Clock } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find restaurants and dishes filtered by your specific allergen requirements.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Verified Data",
    description: "All allergen information is verified by restaurants and approved by our admin team.",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    icon: Bell,
    title: "Allergen Alerts",
    description: "Get instant notifications when a dish contains any of your flagged allergens.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Users,
    title: "Community Reviews",
    description: "Read reviews from users with similar allergies about their dining experiences.",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: Leaf,
    title: "Ingredient Details",
    description: "View complete ingredient lists with clear allergen highlighting for every dish.",
    gradient: "from-lime-500/20 to-emerald-500/20",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Restaurants update their menus in real-time, so you always have accurate info.",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
]

function Card3D({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="h-full"
      >
        {children}
      </div>
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/30 to-transparent rounded-2xl blur-xl"
      />
    </motion.div>
  )
}

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" ref={ref} className="py-20 lg:py-32 bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8 max-w-xs"
          />
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-foreground text-balance">
            Everything you need to dine safely
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Our comprehensive platform ensures you have all the information needed to make safe dining choices.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" style={{ perspective: "1000px" }}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, rotateX: -10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Card3D className="relative h-full">
                <div
                  className={`h-full p-6 lg:p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all duration-300 group relative overflow-hidden`}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors relative"
                    >
                      <feature.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
                      <div className="absolute inset-0 rounded-xl bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>

                    <h3 className="mt-6 text-lg font-medium text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{feature.description}</p>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="mt-4 text-accent text-sm font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Learn more
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
