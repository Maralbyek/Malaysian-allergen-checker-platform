import { z } from 'zod'
import { router, vendorProcedure, protectedProcedure } from '../init'
import { TRPCError } from '@trpc/server'

export const vendorRouter = router({
  // Register as vendor
  registerVendor: protectedProcedure
    .input(z.object({
      businessNameEn: z.string().min(2),
      businessNameMs: z.string().optional(),
      businessType: z.enum(['hawker', 'warung', 'mamak', 'restaurant']),
      address: z.string().min(10),
      state: z.string(),
      halalCertified: z.boolean(),
      halalCertNumber: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if already a vendor
      const existing = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already registered as vendor'
        })
      }

      // Update user role
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { role: 'VENDOR' }
      })

      // Create vendor
      const vendor = await ctx.prisma.vendor.create({
        data: {
          ...input,
          userId: ctx.user.id,
          status: 'PENDING',
        }
      })

      return vendor
    }),

  // Get vendor dashboard stats
  getDashboardStats: vendorProcedure
    .query(async ({ ctx }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      const [total, pending, approved, rejected] = await Promise.all([
        ctx.prisma.dish.count({ where: { vendorId: vendor.id } }),
        ctx.prisma.dish.count({ where: { vendorId: vendor.id, status: 'PENDING' } }),
        ctx.prisma.dish.count({ where: { vendorId: vendor.id, status: 'APPROVED' } }),
        ctx.prisma.dish.count({ where: { vendorId: vendor.id, status: 'REJECTED' } }),
      ])

      return {
        totalDishes: total,
        pendingDishes: pending,
        approvedDishes: approved,
        rejectedDishes: rejected,
        vendorStatus: vendor.status,
      }
    }),

  // Get vendor profile
  getProfile: vendorProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            }
          }
        }
      })
    }),

  // Create new dish
  createDish: vendorProcedure
    .input(z.object({
      nameEn: z.string().min(2),
      nameMs: z.string().optional(),
      descriptionEn: z.string().min(10),
      descriptionMs: z.string().optional(),
      category: z.string(),
      cuisineType: z.string(),
      price: z.number().positive(),
      imageUrl: z.string().optional(), // Accept both URLs and base64 data URLs
      preparationTime: z.number().optional(),
      servingSize: z.string().optional(),
      calories: z.number().optional(),
      isVegetarian: z.boolean().default(false),
      isVegan: z.boolean().default(false),
      isHalal: z.boolean().default(true),
      allergens: z.array(z.object({
        allergenId: z.string(),
        contains: z.enum(['YES', 'NO', 'MAY_CONTAIN']),
        notes: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      // Allow vendors to create dishes even if their profile is pending
      // The dishes will be created with PENDING status and require admin approval
      if (vendor.status === 'REJECTED' || vendor.status === 'SUSPENDED') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Your vendor account is not active. Please contact support.' })
      }

      const { allergens, ...dishData } = input

      const dish = await ctx.prisma.dish.create({
        data: {
          ...dishData,
          vendorId: vendor.id,
          status: 'PENDING',
          allergenInfoComplete: allergens.length > 0,
          allergenMappings: {
            create: allergens.map(a => ({
              allergenId: a.allergenId,
              contains: a.contains,
              notes: a.notes,
            }))
          }
        },
        include: {
          allergenMappings: {
            include: { allergen: true }
          }
        }
      })

      return dish
    }),

  // Get vendor's dishes
  getMyDishes: vendorProcedure
    .input(z.object({
      status: z.enum(['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED']).optional().default('ALL'),
    }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) return []

      const where: any = { vendorId: vendor.id }
      if (input.status !== 'ALL') {
        where.status = input.status
      }

      return ctx.prisma.dish.findMany({
        where,
        include: {
          allergenMappings: {
            include: { allergen: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }),

  // Get single dish (must own it)
  getDish: vendorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      const dish = await ctx.prisma.dish.findFirst({
        where: {
          id: input.id,
          vendorId: vendor.id,
        },
        include: {
          allergenMappings: {
            include: { allergen: true }
          }
        }
      })

      if (!dish) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Dish not found' })
      }

      return dish
    }),

  // Update dish
  updateDish: vendorProcedure
    .input(z.object({
      id: z.string(),
      nameEn: z.string().min(2).optional(),
      nameMs: z.string().optional(),
      descriptionEn: z.string().min(10).optional(),
      descriptionMs: z.string().optional(),
      category: z.string().optional(),
      cuisineType: z.string().optional(),
      price: z.number().positive().optional(),
      imageUrl: z.string().optional(), // Accept both URLs and base64 data URLs
      preparationTime: z.number().optional(),
      servingSize: z.string().optional(),
      calories: z.number().optional(),
      isAvailable: z.boolean().optional(),
      isVegetarian: z.boolean().optional(),
      isVegan: z.boolean().optional(),
      isHalal: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify ownership
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      const dish = await ctx.prisma.dish.findFirst({
        where: {
          id,
          vendorId: vendor.id,
        }
      })

      if (!dish) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot update this dish' })
      }

      return ctx.prisma.dish.update({
        where: { id },
        data,
        include: {
          allergenMappings: {
            include: { allergen: true }
          }
        }
      })
    }),

  // Delete dish
  deleteDish: vendorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      const dish = await ctx.prisma.dish.findFirst({
        where: {
          id: input.id,
          vendorId: vendor.id,
        }
      })

      if (!dish) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete this dish' })
      }

      await ctx.prisma.dish.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  // Update vendor profile
  updateProfile: vendorProcedure
    .input(z.object({
      businessNameEn: z.string().optional(),
      businessNameMs: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { userId: ctx.user.id }
      })

      if (!vendor) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vendor not found' })
      }

      // Update vendor
      const updatedVendor = await ctx.prisma.vendor.update({
        where: { id: vendor.id },
        data: input,
      })

      // Update user image if provided
      if (input.image) {
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: { image: input.image }
        })
      }

      return updatedVendor
    }),
})
