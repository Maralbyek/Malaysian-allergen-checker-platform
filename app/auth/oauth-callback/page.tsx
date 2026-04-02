"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { trpc } from "@/lib/trpc"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  const utils = trpc.useUtils()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Small delay to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get the pending role from localStorage
        const intendedRole = typeof window !== 'undefined'
          ? localStorage.getItem('oauth-intended-role')
          : null

        // Get current session
        const { data: session } = await authClient.getSession()

        if (session?.user) {
          // If user has CONSUMER role but intended a different role, update it
          if (intendedRole && intendedRole !== 'CONSUMER' && session.user.role === 'CONSUMER') {
            try {
              // Call backend to update role (only works for new OAuth users)
              const response = await fetch('/api/auth/update-oauth-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: intendedRole }),
              })

              if (response.ok) {
                toast.success("Account created!", {
                  description: `Your ${intendedRole.toLowerCase()} account has been set up.`,
                })
              }
            } catch (error) {
              console.error('Failed to update role:', error)
            } finally {
              localStorage.removeItem('oauth-intended-role')
            }
          }

          // Get redirect URL from query params or use default
          const redirectTo = searchParams?.get('redirect') || '/browse'

          // Redirect based on final role
          const finalRedirect = intendedRole === 'VENDOR'
            ? '/vendor'
            : session.user.role === 'ADMIN'
            ? '/admin'
            : session.user.role === 'VENDOR'
            ? '/vendor'
            : redirectTo

          router.push(finalRedirect)
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast.error("Authentication failed", {
          description: "Please try again",
        })
        router.push('/auth/login')
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [router, searchParams, utils])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
        <p className="text-muted-foreground">
          {isProcessing ? "Setting up your account..." : "Redirecting..."}
        </p>
      </div>
    </div>
  )
}
