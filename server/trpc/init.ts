import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/server/lib/auth'
import { prisma } from '@/server/lib/db'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export async function createContext(opts: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({
    headers: opts.req.headers
  })

  return {
    prisma,
    session,
    user: session?.user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: {
      prisma: ctx.prisma,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

// Admin-only procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }
  return next({ ctx })
})

// Vendor-only procedure
export const vendorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'VENDOR') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Vendor access required' })
  }
  return next({ ctx })
})
