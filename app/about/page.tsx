"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Users, Heart, Award, ArrowRight } from "lucide-react"

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "2,500+", label: "Partner Restaurants" },
  { value: "15+", label: "Allergens Tracked" },
  { value: "99.9%", label: "Accuracy Rate" },
]

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every piece of allergen information is verified by our team and the restaurant partners.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built with input from people with food allergies, for people with food allergies.",
  },
  {
    icon: Heart,
    title: "Inclusive Dining",
    description: "We believe everyone deserves to enjoy dining out without fear or anxiety.",
  },
  {
    icon: Award,
    title: "Quality Standards",
    description: "Restaurants must meet strict criteria to join our platform, ensuring reliable information.",
  },
]

export default function AboutPage() {
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

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl lg:text-5xl font-semibold mb-6"
          >
            About AllergenSafe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            We are on a mission to make dining out safe and enjoyable for everyone with food allergies.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-semibold mb-6">Our Story</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-4">
                AllergenSafe was born from a personal experience. Our founder, after witnessing a friend 
                have a severe allergic reaction at a restaurant, realized how difficult it is for people 
                with food allergies to dine out safely.
              </p>
              <p className="mb-4">
                We built AllergenSafe to bridge the gap between restaurants and diners with food allergies. 
                Our platform allows restaurants to clearly communicate their ingredients and allergen 
                information, while giving users the tools to make informed dining decisions.
              </p>
              <p>
                Today, we partner with thousands of restaurants and serve over 50,000 users who can now 
                dine with confidence, knowing exactly what is in their food.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-semibold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-semibold mb-6">Join Our Community</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Whether you are a diner with food allergies or a restaurant looking to better serve your customers, 
            we would love to have you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/browse">
                Browse Restaurants
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent">
              <Link href="/auth/register">Partner With Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AllergenSafe. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
