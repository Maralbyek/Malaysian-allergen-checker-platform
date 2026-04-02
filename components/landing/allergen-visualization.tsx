"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { AlertTriangle, Check, X } from "lucide-react"

const allergens = [
  { name: "Peanuts", color: "#D97706", icon: "🥜" },
  { name: "Tree Nuts", color: "#92400E", icon: "🌰" },
  { name: "Milk", color: "#F5F5F4", icon: "🥛" },
  { name: "Eggs", color: "#FEF3C7", icon: "🥚" },
  { name: "Wheat", color: "#F59E0B", icon: "🌾" },
  { name: "Soy", color: "#84CC16", icon: "🫛" },
  { name: "Fish", color: "#06B6D4", icon: "🐟" },
  { name: "Shellfish", color: "#F43F5E", icon: "🦐" },
]

const sampleDish = {
  name: "Pad Thai",
  restaurant: "Thai Kitchen",
  ingredients: ["Rice Noodles", "Eggs", "Peanuts", "Tofu", "Bean Sprouts", "Green Onions", "Lime"],
  containsAllergens: ["Peanuts", "Eggs", "Soy"],
}

export function AllergenVisualization() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(["Peanuts", "Eggs"])
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) => (prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]))
    setShowResults(false)
  }

  const scanDish = () => {
    setIsScanning(true)
    setShowResults(false)
    setTimeout(() => {
      setIsScanning(false)
      setShowResults(true)
    }, 2000)
  }

  const hasConflict = selectedAllergens.some((a) => sampleDish.containsAllergens.includes(a))
  const conflicts = selectedAllergens.filter((a) => sampleDish.containsAllergens.includes(a))

  return (
    <section ref={ref} className="py-20 lg:py-32 relative overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute top-1/4 -left-48 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.3, 1, 1.3],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="absolute bottom-1/4 -right-48 w-96 h-96 bg-destructive/10 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-foreground text-balance">
            See how allergen detection works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Select your allergies and watch our system scan dishes for potential risks in real-time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-6">Your Allergies</h3>
            <div className="flex flex-wrap gap-3">
              {allergens.map((allergen, index) => {
                const isSelected = selectedAllergens.includes(allergen.name)
                return (
                  <motion.button
                    key={allergen.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleAllergen(allergen.name)}
                    className={`
                      relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                      flex items-center gap-2 overflow-hidden
                      ${
                        isSelected
                          ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25"
                          : "bg-card border border-border hover:border-accent/50"
                      }
                    `}
                  >
                    <span className="text-lg">{allergen.icon}</span>
                    {allergen.name}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-1">
                          <X className="w-3 h-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-destructive-foreground rounded-full"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scanDish}
              disabled={selectedAllergens.length === 0 || isScanning}
              className="mt-8 w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isScanning ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Scanning dish...
                  </motion.div>
                ) : (
                  <motion.span key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Scan "{sampleDish.name}"
                  </motion.span>
                )}
              </AnimatePresence>

              {isScanning && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
                />
              )}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 relative overflow-hidden">
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card/80 backdrop-blur-sm z-20 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        boxShadow: ["0 0 0 0 rgba(var(--accent), 0.4)", "0 0 0 20px rgba(var(--accent), 0)"],
                      }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-medium">{sampleDish.name}</h3>
                  <p className="text-muted-foreground">{sampleDish.restaurant}</p>
                </div>
                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
                        ${hasConflict ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}
                      `}
                    >
                      {hasConflict ? (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Contains Allergens
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Safe to Eat
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {sampleDish.ingredients.map((ingredient, index) => {
                    const isAllergen = sampleDish.containsAllergens.includes(ingredient)
                    const isConflict = conflicts.includes(ingredient)
                    return (
                      <motion.span
                        key={ingredient}
                        initial={{ opacity: 0, y: 10 }}
                        animate={showResults ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 0 }}
                        transition={{ delay: showResults ? 0.1 * index : 0 }}
                        className={`
                          px-3 py-1 rounded-full text-sm transition-all duration-300
                          ${
                            isConflict && showResults
                              ? "bg-destructive text-destructive-foreground animate-pulse"
                              : isAllergen
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                : "bg-secondary text-foreground"
                          }
                        `}
                      >
                        {ingredient}
                        {isConflict && showResults && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1">
                            ⚠️
                          </motion.span>
                        )}
                      </motion.span>
                    )
                  })}
                </div>
              </div>

              <AnimatePresence>
                {showResults && hasConflict && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                        >
                          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <div>
                          <p className="font-medium text-destructive">Allergen Warning</p>
                          <p className="text-sm text-destructive/80 mt-1">
                            This dish contains {conflicts.join(" and ")}, which you have marked as allergens.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
