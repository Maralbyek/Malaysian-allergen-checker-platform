import { router, publicProcedure, protectedProcedure } from '../init'

export const authRouter = router({
  // Get current user
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          vendor: {
            select: {
              id: true,
              businessNameEn: true,
              businessNameMs: true,
              status: true,
            }
          }
        }
      })

      return user
    }),

  // Check session
  checkSession: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session || !ctx.user) {
        return { authenticated: false, user: null }
      }

      return {
        authenticated: true,
        user: {
          id: ctx.user.id,
          email: ctx.user.email,
          name: ctx.user.name,
          role: ctx.user.role,
        }
      }
    }),
})
