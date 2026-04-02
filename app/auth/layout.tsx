import type React from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">AllergenSafe</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-serif font-bold leading-tight">
              Dine with confidence.<br />
              Know what you eat.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Join thousands of users and vendors who trust AllergenSafe for
              accurate food allergen information.
            </p>
            <div className="flex gap-8 text-sm">
              <div>
                <div className="text-3xl font-bold text-accent">12k+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">2.8k+</div>
                <div className="text-muted-foreground">Safe Dishes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">150+</div>
                <div className="text-muted-foreground">Restaurants</div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Trusted by health-conscious diners worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
