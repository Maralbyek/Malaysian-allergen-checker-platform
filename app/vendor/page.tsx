"use client"

import { motion } from "framer-motion"
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Eye,
  Plus,
  ArrowUpRight,
  Loader2,
  Store,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"


export default function VendorDashboard() {
  // Fetch vendor profile
  const { data: vendorProfile, isLoading: profileLoading } = trpc.vendor.getProfile.useQuery()
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.vendor.getDashboardStats.useQuery()
  
  // Fetch vendor's dishes
  const { data: dishes = [], isLoading: dishesLoading } = trpc.vendor.getMyDishes.useQuery({ status: 'ALL' })
  
  // Calculate allergen statistics from dishes
  const allergenStats = dishes.reduce((acc, dish) => {
    dish.allergenMappings.forEach(mapping => {
      if (mapping.contains === 'YES') {
        const existing = acc.find(a => a.name === mapping.allergen.nameEn)
        if (existing) {
          existing.count++
        } else {
          acc.push({
            name: mapping.allergen.nameEn,
            count: 1,
            percentage: 0
          })
        }
      }
    })
    return acc
  }, [] as { name: string; count: number; percentage: number }[])
  
  // Calculate percentages
  const totalDishesWithAllergens = allergenStats.reduce((sum, a) => sum + a.count, 0)
  allergenStats.forEach(stat => {
    stat.percentage = totalDishesWithAllergens > 0 ? Math.round((stat.count / totalDishesWithAllergens) * 100) : 0
  })
  
  // Sort by count and take top 5
  const topAllergens = allergenStats.sort((a, b) => b.count - a.count).slice(0, 5)
  
  // Format stats for display
  const statsData = stats ? [
    {
      title: "Total Foods",
      value: stats.totalDishes.toString(),
      change: "+3 this month",
      icon: UtensilsCrossed,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Pending Approval",
      value: stats.pendingDishes.toString(),
      change: "Awaiting review",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Approved",
      value: stats.approvedDishes.toString(),
      change: stats.totalDishes > 0 ? `${Math.round((stats.approvedDishes / stats.totalDishes) * 100)}% approval rate` : "0% approval rate",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Views This Week",
      value: "1,234",
      change: "+12% from last week",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ] : []
  
  const vendorName = vendorProfile?.businessNameEn || "Vendor"
  const vendorStatus = vendorProfile?.status || 'PENDING'
  
  // Get recent dishes (last 4)
  const recentFoods = dishes.slice(0, 4).map(dish => ({
    id: dish.id,
    name: dish.nameEn,
    status: dish.status.toLowerCase(),
    allergens: dish.allergenMappings
      .filter(mapping => mapping.contains === 'YES')
      .map(mapping => mapping.allergen.nameEn),
    image: dish.imageUrl || "/placeholder.jpg",
  }))
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif font-bold"
          >
            Welcome back, {vendorName}
            {vendorStatus === 'PENDING' && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                Pending Approval
              </Badge>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Here&apos;s what&apos;s happening with your menu today.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button asChild className="gap-2">
            <Link href="/vendor/foods/new">
              <Plus className="h-4 w-4" />
              Add New Food
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Foods */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Foods</CardTitle>
                <CardDescription>Your latest menu items</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vendor/foods" className="gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dishesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </div>
              ) : dishes.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No dishes yet</p>
                  <Button asChild className="gap-2">
                    <Link href="/vendor/foods/new">
                      <Plus className="h-4 w-4" />
                      Add Your First Dish
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFoods.map((food, index) => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                        <img
                          src={food.image || "/placeholder.svg"}
                          alt={food.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{food.name}</h4>
                          <Badge
                            variant={food.status === "approved" ? "default" : "secondary"}
                            className={
                              food.status === "approved"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            }
                          >
                            {food.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {food.allergens.slice(0, 3).map((allergen) => (
                            <span
                              key={allergen}
                              className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
                            >
                              {allergen}
                            </span>
                          ))}
                          {food.allergens.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              +{food.allergens.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Allergen Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Allergen Overview
              </CardTitle>
              <CardDescription>Distribution across your menu</CardDescription>
            </CardHeader>
            <CardContent>
              {dishesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : topAllergens.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No allergen data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topAllergens.map((allergen, index) => (
                    <motion.div
                      key={allergen.name}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "100%" }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{allergen.name}</span>
                        <span className="text-muted-foreground">
                          {allergen.count} items ({allergen.percentage}%)
                        </span>
                      </div>
                      <Progress value={allergen.percentage} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
