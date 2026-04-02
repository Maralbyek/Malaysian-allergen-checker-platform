"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "How accurate is the allergen information?",
    answer:
      "Our allergen data is 99% accurate. All information is provided directly by restaurants and verified by our team. We also have a community review system that helps identify any discrepancies quickly.",
  },
  {
    question: "Is the app free to use?",
    answer:
      "Yes! Basic features including restaurant browsing, allergen checking, and profile creation are completely free. We offer a premium tier with advanced features like personalized recommendations and offline access.",
  },
  {
    question: "How do restaurants join the platform?",
    answer:
      "Restaurants can sign up through our vendor portal. They provide their menu items and allergen information, which our admin team reviews and approves before going live on the platform.",
  },
  {
    question: "What allergens do you track?",
    answer:
      "We track all 14 major allergens recognized by food safety authorities: peanuts, tree nuts, milk, eggs, wheat, soy, fish, shellfish, sesame, mustard, celery, lupin, molluscs, and sulphites.",
  },
  {
    question: "Can I use the app offline?",
    answer:
      "Premium users can download restaurant menus for offline access. This is perfect for travel or areas with limited connectivity. Data syncs automatically when you're back online.",
  },
]

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0]
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-border last:border-0"
    >
      <button onClick={onToggle} className="w-full py-6 flex items-center justify-between text-left group">
        <span className="text-lg font-medium text-foreground group-hover:text-accent transition-colors pr-8">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isOpen ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
          }`}
        >
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              className="pb-6 text-muted-foreground leading-relaxed"
            >
              {faq.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQAccordion() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-secondary/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-medium text-foreground text-balance">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">Everything you need to know about AllergenSafe.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 lg:p-8"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-muted-foreground"
        >
          Still have questions?{" "}
          <a href="/contact" className="text-accent hover:underline">
            Contact our support team
          </a>
        </motion.p>
      </div>
    </section>
  )
}
