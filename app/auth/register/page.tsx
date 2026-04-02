"use client"

import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  User,
  Store,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

const accountTypes = [
  {
    id: "user",
    title: "I'm a User",
    description: "Browse restaurants and check food allergens",
    icon: Users,
    features: ["View restaurant menus", "Check allergen information", "Save your allergy profile"],
  },
  {
    id: "vendor",
    title: "I'm a Vendor",
    description: "Register your restaurant and manage food listings",
    icon: Store,
    features: ["List your menu items", "Provide allergen details", "Reach allergy-conscious customers"],
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
  })

  const registerVendorMutation = trpc.vendor.registerVendor.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Register user with Better Auth
      const role = accountType === "vendor" ? "VENDOR" : "CONSUMER"
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role,
      })

      if (error) {
        toast.error("Registration failed", {
          description: error.message || "Could not create account",
        })
        setIsLoading(false)
        return
      }

      if (data) {
        // If vendor, create basic vendor profile
        if (accountType === "vendor") {
          try {
            // Small delay to ensure session is established
            await new Promise(resolve => setTimeout(resolve, 500))

            // Create vendor profile with basic info
            await registerVendorMutation.mutateAsync({
              businessNameEn: formData.businessName || formData.name + "'s Restaurant",
              businessType: "restaurant" as const,
              address: "To be completed",
              state: "To be completed",
              halalCertified: false,
            })

            toast.success("Vendor account created!", {
              description: "Your vendor profile has been created. Complete your details to start adding dishes.",
            })
            router.push("/vendor/settings")
          } catch (vendorError: any) {
            console.error("Vendor creation error:", vendorError)
            toast.warning("Account created", {
              description: "Please complete your vendor profile at settings.",
            })
            router.push("/vendor/settings")
          }
        } else {
          // Consumer account - go to browse
          toast.success("Account created!", {
            description: "Welcome to AllergenSafe!",
          })
          router.push("/browse")
        }
      }
    } catch (err) {
      console.error("Registration error:", err)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // Store the account type before OAuth redirect
      const role = accountType === "vendor" ? "VENDOR" : "CONSUMER"
      const callbackURL = accountType === "vendor" ? "/vendor" : "/browse"

      // Better Auth will redirect to this URL after OAuth
      // We'll create a callback handler to set the role
      if (typeof window !== 'undefined') {
        localStorage.setItem('oauth-intended-role', role)
      }

      await authClient.signIn.social({
        provider: "google",
        callbackURL: `/auth/oauth-callback?redirect=${encodeURIComponent(callbackURL)}`,
      })
    } catch (err) {
      toast.error("Error", {
        description: "Failed to sign in with Google",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold">AllergenSafe</span>
        </Link>
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif">Create an account</CardTitle>
          <CardDescription>
            {step === 1 ? "Choose your account type" : "Enter your details to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Account Type Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {accountTypes.map((type) => {
                const isSelected = accountType === type.id
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => setAccountType(type.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-accent bg-accent/5"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? "bg-accent text-accent-foreground" : "bg-muted"
                          }`}
                        >
                          <type.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{type.title}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                          <ul className="mt-3 space-y-1">
                            {type.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle2 className="h-3 w-3 text-accent" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                )
              })}

              <Button
                className="w-full mt-4"
                disabled={!accountType}
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 -ml-2"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {accountType === "vendor" ? "Contact Name" : "Full Name"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {accountType === "vendor" && (
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="businessName"
                        placeholder="Your Restaurant Name"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with a number and special character
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" className="mt-1" required />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-accent hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-accent hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    `Create ${accountType === "vendor" ? "Vendor" : ""} Account`
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </motion.div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
