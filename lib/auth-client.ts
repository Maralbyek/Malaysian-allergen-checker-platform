import { createAuthClient } from "better-auth/react"
import type { auth } from "@/server/lib/auth"

export const authClient = createAuthClient<typeof auth>({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
})

export const {
  signIn,
  signUp,
  signOut,
  useSession
} = authClient

export type { Session } from "@/server/lib/auth"
