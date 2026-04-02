import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Marquee } from "@/components/landing/marquee"
import { Features } from "@/components/landing/features"
import { AllergenVisualization } from "@/components/landing/allergen-visualization"
import { HowItWorks } from "@/components/landing/how-it-works"
import { AnimatedStats } from "@/components/landing/animated-stats"
import { AppPreview } from "@/components/landing/app-preview"
import { Testimonials } from "@/components/landing/testimonials"
import { FAQAccordion } from "@/components/landing/faq-accordion"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Marquee />
      <Features />
      <AllergenVisualization />
      <HowItWorks />
      <AnimatedStats />
      <AppPreview />
      <Testimonials />
      <FAQAccordion />
      <CTA />
      <Footer />
    </main>
  )
}
