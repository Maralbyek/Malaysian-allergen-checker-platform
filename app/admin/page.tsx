"use client"

import { motion } from "framer-motion"
import {
  Store,
  UtensilsCrossed,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"


export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery()
  
  // Fetch pending vendors
  const { data: pendingVendors = [], isLoading: vendorsLoading } = trpc.admin.getPendingVendors.useQuery()
  
  // Fetch pending dishes
  const { data: pendingDishes = [], isLoading: dishesLoading } = trpc.admin.getPendingDishes.useQuery()
  
  // Fetch recent activity (audit logs)
  const { data: auditLogsData, isLoading: logsLoading } = trpc.admin.getAuditLogs.useQuery({ limit: 10 })
  
  // Mutations for quick actions
  const approveVendorMutation = trpc.admin.approveVendor.useMutation()
  const rejectVendorMutation = trpc.admin.rejectVendor.useMutation()
  const approveDishMutation = trpc.admin.approveDish.useMutation()
  const rejectDishMutation = trpc.admin.rejectDish.useMutation()
  
  const handleApproveVendor = async (vendorId: string) => {
    try {
      await approveVendorMutation.mutateAsync({ vendorId })
      toast.success("Vendor approved successfully")
      // Refetch data
      window.location.reload()
    } catch (error) {
      toast.error("Failed to approve vendor")
    }
  }
  
  const handleRejectVendor = async (vendorId: string) => {
    try {
      await rejectVendorMutation.mutateAsync({ vendorId, reason: "Rejected by admin" })
      toast.success("Vendor rejected")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to reject vendor")
    }
  }
  
  const handleApproveDish = async (dishId: string) => {
    try {
      await approveDishMutation.mutateAsync({ dishId })
      toast.success("Dish approved successfully")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to approve dish")
    }
  }
  
  const handleRejectDish = async (dishId: string) => {
    try {
      await rejectDishMutation.mutateAsync({ dishId, reason: "Rejected by admin" })
      toast.success("Dish rejected")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to reject dish")
    }
  }
  
  // Format stats for display
  const statsData = stats ? [
    {
      title: "Total Vendors",
      value: stats.totalVendors.toString(),
      change: "+12%",
      trend: "up" as const,
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Foods",
      value: stats.totalDishes.toString(),
      change: "+8%",
      trend: "up" as const,
      icon: UtensilsCrossed,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Active Users",
      value: stats.totalUsers.toString(),
      change: "+23%",
      trend: "up" as const,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingDishes.toString(),
      change: "-5%",
      trend: "down" as const,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ] : []
  
  const recentActivity = auditLogsData?.logs.map(log => ({
    id: log.id,
    action: log.actionType.replace('_', ' ').toUpperCase(),
    subject: `${log.entityType} #${log.entityId}`,
    time: new Date(log.createdAt).toLocaleString(),
    icon: log.actionType.includes('APPROVED') ? CheckCircle2 : 
          log.actionType.includes('REJECTED') ? XCircle : 
          log.actionType.includes('VENDOR') ? Store : AlertTriangle,
    iconColor: log.actionType.includes('APPROVED') ? "text-green-600" : 
                log.actionType.includes('REJECTED') ? "text-red-600" : 
                log.actionType.includes('VENDOR') ? "text-blue-600" : "text-orange-600",
    bgColor: log.actionType.includes('APPROVED') ? "bg-green-100" : 
              log.actionType.includes('REJECTED') ? "bg-red-100" : 
              log.actionType.includes('VENDOR') ? "bg-blue-100" : "bg-orange-100",
  })) || []
  
  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return "Less than 1 hour ago"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold"
        >
          Admin Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Manage vendors, foods, and platform settings
        </motion.p>
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
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Vendors */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Pending Vendors
                </CardTitle>
                <CardDescription>{pendingVendors.length} awaiting approval</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/vendors">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingVendors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending vendors</p>
              ) : (
                <div className="space-y-4">
                  {pendingVendors.slice(0, 3).map((vendor) => (
                    <div
                      key={vendor.id}
                      className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={vendor.imageUrl || "/placeholder.svg"} />
                        <AvatarFallback>{vendor.businessNameEn[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{vendor.businessNameEn}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(String(vendor.createdAt))}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => handleRejectVendor(vendor.id)}
                          disabled={rejectVendorMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveVendor(vendor.id)}
                          disabled={approveVendorMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Foods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Pending Food Reviews
                </CardTitle>
                <CardDescription>{pendingDishes.length} items need review</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/foods">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dishesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              ) : pendingDishes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending dishes</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Item</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Allergens</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDishes.slice(0, 4).map((dish) => (
                      <TableRow key={dish.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden">
                              <img
                                src={dish.imageUrl || "/placeholder.svg"}
                                alt={dish.nameEn}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{dish.nameEn}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{dish.vendor.businessNameEn}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {dish.allergenMappings
                              .filter(mapping => mapping.contains === 'YES')
                              .slice(0, 2)
                              .map((mapping) => (
                                <span
                                  key={mapping.allergen.id}
                                  className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
                                >
                                  {mapping.allergen.icon} {mapping.allergen.nameEn}
                                </span>
                              ))}
                            {dish.allergenMappings.filter(mapping => mapping.contains === 'YES').length > 2 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                +{dish.allergenMappings.filter(mapping => mapping.contains === 'YES').length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatTimeAgo(String(dish.createdAt))}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                              <Link href={`/admin/foods/${dish.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => handleRejectDish(dish.id)}
                              disabled={rejectDishMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveDish(dish.id)}
                              disabled={approveDishMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`rounded-full p-2 ${activity.bgColor}`}>
                      <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.subject}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
