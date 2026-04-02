import { z } from 'zod'
import { router, adminProcedure } from '../init'

export const adminRouter = router({
  // Get dashboard stats
  getDashboardStats: adminProcedure
    .query(async ({ ctx }) => {
      const [totalVendors, totalDishes, totalUsers, pendingVendors, pendingDishes, approvedVendors] = await Promise.all([
        ctx.prisma.vendor.count(),
        ctx.prisma.dish.count(),
        ctx.prisma.user.count(),
        ctx.prisma.vendor.count({ where: { status: 'PENDING' } }),
        ctx.prisma.dish.count({ where: { status: 'PENDING' } }),
        ctx.prisma.vendor.count({ where: { status: 'APPROVED' } }),
      ])

      return {
        totalVendors,
        totalDishes,
        totalUsers,
        pendingVendors,
        pendingDishes,
        approvedVendors,
      }
    }),

  // Get pending vendors
  getPendingVendors: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.vendor.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    }),

  // Approve vendor
  approveVendor: adminProcedure
    .input(z.object({
      vendorId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.update({
        where: { id: input.vendorId },
        data: {
          status: 'APPROVED',
          verifiedBy: ctx.user.id,
          verifiedAt: new Date(),
        }
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.id,
          actionType: 'VENDOR_APPROVED',
          entityType: 'VENDOR',
          entityId: vendor.id,
        }
      })

      return vendor
    }),

  // Reject vendor
  rejectVendor: adminProcedure
    .input(z.object({
      vendorId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.update({
        where: { id: input.vendorId },
        data: { status: 'REJECTED' }
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.id,
          actionType: 'VENDOR_REJECTED',
          entityType: 'VENDOR',
          entityId: vendor.id,
          metadata: { reason: input.reason }
        }
      })

      return vendor
    }),

  // Suspend vendor
  suspendVendor: adminProcedure
    .input(z.object({
      vendorId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.update({
        where: { id: input.vendorId },
        data: { status: 'SUSPENDED' }
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.id,
          actionType: 'VENDOR_SUSPENDED',
          entityType: 'VENDOR',
          entityId: vendor.id,
          metadata: { reason: input.reason }
        }
      })

      return vendor
    }),

  // Get pending dishes
  getPendingDishes: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.dish.findMany({
        where: { status: 'PENDING' },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                }
              }
            }
          },
          allergenMappings: {
            include: { allergen: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    }),

  // Approve dish
  approveDish: adminProcedure
    .input(z.object({ dishId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dish = await ctx.prisma.dish.update({
        where: { id: input.dishId },
        data: {
          status: 'APPROVED',
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        }
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.id,
          actionType: 'DISH_APPROVED',
          entityType: 'DISH',
          entityId: dish.id,
        }
      })

      return dish
    }),

  // Reject dish
  rejectDish: adminProcedure
    .input(z.object({
      dishId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dish = await ctx.prisma.dish.update({
        where: { id: input.dishId },
        data: { status: 'REJECTED' }
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user.id,
          actionType: 'DISH_REJECTED',
          entityType: 'DISH',
          entityId: dish.id,
          metadata: { reason: input.reason }
        }
      })

      return dish
    }),

  // Get all vendors
  getAllVendors: adminProcedure
    .input(z.object({
      status: z.enum(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional().default('ALL'),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where: any = {}
      if (input.status !== 'ALL') {
        where.status = input.status
      }

      const [vendors, total] = await Promise.all([
        ctx.prisma.vendor.findMany({
          where,
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            },
            _count: {
              select: { dishes: true }
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

  // Get all dishes
  getAllDishes: adminProcedure
    .input(z.object({
      status: z.enum(['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED']).optional().default('ALL'),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where: any = {}
      if (input.status !== 'ALL') {
        where.status = input.status
      }

      const [dishes, total] = await Promise.all([
        ctx.prisma.dish.findMany({
          where,
          include: {
            vendor: {
              select: {
                businessNameEn: true,
                businessNameMs: true,
              }
            },
            allergenMappings: {
              include: { allergen: true }
            }
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' }
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

  // Get all users
  getAllUsers: adminProcedure
    .input(z.object({
      role: z.enum(['ALL', 'ADMIN', 'VENDOR', 'CONSUMER']).optional().default('ALL'),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where: any = {}
      if (input.role !== 'ALL') {
        where.role = input.role
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.user.count({ where })
      ])

      return {
        users,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      }
    }),

  // Get recent audit logs
  getAuditLogs: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.auditLog.count()
      ])

      return {
        logs,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      }
    }),

  // Manage allergens
  createAllergen: adminProcedure
    .input(z.object({
      nameEn: z.string(),
      nameMs: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionMs: z.string().optional(),
      icon: z.string().optional(),
      isMajor: z.boolean().default(true),
      displayOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.allergen.create({
        data: input
      })
    }),

  updateAllergen: adminProcedure
    .input(z.object({
      id: z.string(),
      nameEn: z.string().optional(),
      nameMs: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionMs: z.string().optional(),
      icon: z.string().optional(),
      isMajor: z.boolean().optional(),
      displayOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.allergen.update({
        where: { id },
        data
      })
    }),

  // Get all users
  getAllUsers: adminProcedure
    .input(z.object({
      role: z.enum(['ALL', 'CONSUMER', 'VENDOR', 'ADMIN']).optional().default('ALL'),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where: any = {}
      if (input.role !== 'ALL') {
        where.role = input.role
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.user.count({ where })
      ])

      return {
        users,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      }
    }),

  // Update user role (promote to ADMIN or change roles)
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['CONSUMER', 'VENDOR', 'ADMIN']),
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role }
      })

      return updatedUser
    }),
})
