"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">AllergenSafe</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-serif text-4xl font-semibold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using AllergenSafe, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">2. Use of Services</h2>
            <p className="text-muted-foreground mb-4">
              AllergenSafe provides allergen information for educational purposes. While we strive 
              for accuracy, always confirm allergen information directly with restaurants before dining.
            </p>

            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account.
            </p>

            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">4. Vendor Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              Vendors are responsible for providing accurate allergen information for their food items. 
              Vendors must update information promptly when recipes or ingredients change.
            </p>

            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              AllergenSafe is not liable for any allergic reactions or health issues that may occur. 
              Always exercise caution and consult with healthcare professionals regarding food allergies.
            </p>

            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">6. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. Continued use of our services 
              after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="font-serif text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms of Service, please{" "}
              <Link href="/contact" className="text-accent hover:underline">contact us</Link>.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AllergenSafe. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
