import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../init'

export const consumerRouter = router({
  // Browse dishes with filters
  browseDishes: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      cuisineType: z.string().optional(),
      excludeAllergens: z.array(z.string()).optional(),
      sortBy: z.enum(['rating', 'price_low', 'price_high', 'newest']).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      // Build where clause
      const where: any = {
        status: 'APPROVED',
        isAvailable: true,
      }

      if (input.search) {
        where.OR = [
          { nameEn: { contains: input.search } },
          { nameMs: { contains: input.search } },
          { descriptionEn: { contains: input.search } },
        ]
      }

      if (input.category) {
        where.category = input.category
      }

      if (input.cuisineType) {
        where.cuisineType = input.cuisineType
      }

      // Exclude allergens (complex query)
      if (input.excludeAllergens && input.excludeAllergens.length > 0) {
        where.allergenMappings = {
          none: {
            allergenId: { in: input.excludeAllergens },
            contains: { in: ['YES', 'MAY_CONTAIN'] }
          }
        }
      }

      // Sort order
      let orderBy: any = { createdAt: 'desc' }
      if (input.sortBy === 'price_low') {
        orderBy = { price: 'asc' }
      } else if (input.sortBy === 'price_high') {
        orderBy = { price: 'desc' }
      } else if (input.sortBy === 'newest') {
        orderBy = { createdAt: 'desc' }
      }

      const [dishes, total] = await Promise.all([
        ctx.prisma.dish.findMany({
          where,
          include: {
            vendor: {
              select: {
                id: true,
                businessNameEn: true,
                businessNameMs: true,
                businessType: true,
                state: true,
                halalCertified: true,
              }
            },
            allergenMappings: {
              include: {
                allergen: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameMs: true,
                    icon: true,
                  }
                }
              }
            }
          },
          skip,
          take: input.limit,
          orderBy
        }),
        ctx.prisma.dish.count({ where })
      ])

      return {
        dishes,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      }
    }),

  // Get dish by ID
  getDish: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const dish = await ctx.prisma.dish.findUnique({
        where: { id: input.id },
        include: {
          vendor: {
            select: {
              id: true,
              businessNameEn: true,
              businessNameMs: true,
              businessType: true,
              address: true,
              state: true,
              halalCertified: true,
            }
          },
          allergenMappings: {
            include: {
              allergen: {
                select: {
                  id: true,
                  nameEn: true,
                  nameMs: true,
                  descriptionEn: true,
                  descriptionMs: true,
                  icon: true,
                }
              }
            }
          }
        }
      })

      if (!dish) {
        throw new Error('Dish not found')
      }

      return dish
    }),

  // Get all allergens
  getAllergens: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.allergen.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      })
    }),

  // Get restaurant/vendor by ID
  getRestaurant: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: input.id, status: 'APPROVED' },
        include: {
          dishes: {
            where: {
              status: 'APPROVED',
              isAvailable: true,
            },
            include: {
              allergenMappings: {
                include: {
                  allergen: true
                }
              }
            }
          },
          _count: {
            select: {
              dishes: {
                where: {
                  status: 'APPROVED'
                }
              }
            }
          }
        }
      })

      if (!vendor) {
        throw new Error('Restaurant not found')
      }

      return vendor
    }),

  // Browse restaurants
  browseRestaurants: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      businessType: z.string().optional(),
      state: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where: any = {
        status: 'APPROVED',
      }

      if (input.search) {
        where.OR = [
          { businessNameEn: { contains: input.search } },
          { businessNameMs: { contains: input.search } },
        ]
      }

      if (input.businessType) {
        where.businessType = input.businessType
      }

      if (input.state) {
        where.state = input.state
      }

      const [vendors, total] = await Promise.all([
        ctx.prisma.vendor.findMany({
          where,
          include: {
            _count: {
              select: {
                dishes: {
                  where: { status: 'APPROVED' }
                }
              }
            }
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.vendor.count({ where })
      ])

      return {
        vendors,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      }
    }),

  // Get user's allergen profile
  getUserAllergenProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await ctx.prisma.userAllergenProfile.findMany({
        where: { userId: ctx.user.id },
        select: {
          id: true,
          allergenId: true,
          severity: true,
          notes: true,
          createdAt: true,
        }
      })
      return profile
    }),

  // Update user's allergen profile
  updateUserAllergenProfile: protectedProcedure
    .input(z.object({
      allergenIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Delete existing profile
      await ctx.prisma.userAllergenProfile.deleteMany({
        where: { userId: ctx.user.id }
      })

      // Create new profile entries
      if (input.allergenIds.length > 0) {
        await ctx.prisma.userAllergenProfile.createMany({
          data: input.allergenIds.map(allergenId => ({
            userId: ctx.user.id,
            allergenId,
          }))
        })
      }

      return { success: true }
    }),

  // Get user's favorite dishes
  getFavoriteDishes: protectedProcedure
    .query(async ({ ctx }) => {
      const favorites = await ctx.prisma.favoriteDish.findMany({
        where: { userId: ctx.user.id },
        select: {
          id: true,
          dishId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })
      return favorites
    }),

  // Add dish to favorites
  addFavoriteDish: protectedProcedure
    .input(z.object({ dishId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const favorite = await ctx.prisma.favoriteDish.create({
        data: {
          userId: ctx.user.id,
          dishId: input.dishId,
        }
      })
      return favorite
    }),

  // Remove dish from favorites
  removeFavoriteDish: protectedProcedure
    .input(z.object({ dishId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.favoriteDish.deleteMany({
        where: {
          userId: ctx.user.id,
          dishId: input.dishId,
        }
      })
      return { success: true }
    }),

  // Get user's favorite vendors
  getFavoriteVendors: protectedProcedure
    .query(async ({ ctx }) => {
      const favorites = await ctx.prisma.favoriteVendor.findMany({
        where: { userId: ctx.user.id },
        select: {
          id: true,
          vendorId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })
      return favorites
    }),

  // Add vendor to favorites
  addFavoriteVendor: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const favorite = await ctx.prisma.favoriteVendor.create({
        data: {
          userId: ctx.user.id,
          vendorId: input.vendorId,
        }
      })
      return favorite
    }),

  // Remove vendor from favorites
  removeFavoriteVendor: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.favoriteVendor.deleteMany({
        where: {
          userId: ctx.user.id,
          vendorId: input.vendorId,
        }
      })
      return { success: true }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      })

      return updatedUser
    }),
})
