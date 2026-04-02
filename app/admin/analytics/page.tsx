"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Store,
  UtensilsCrossed,
  TrendingUp,
  Eye,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { trpc } from "@/lib/trpc"

export default function AdminAnalyticsPage() {
  // Fetch real data from backend
  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery()
  const { data: auditLogsData, isLoading: logsLoading } = trpc.admin.getAuditLogs.useQuery({ limit: 10 })

  const overviewStats = stats ? [
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
    },
    {
      label: "Active Vendors",
      value: stats.approvedVendors.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: Store,
    },
    {
      label: "Listed Dishes",
      value: stats.totalDishes.toString(),
      change: "+15.3%",
      trend: "up" as const,
      icon: UtensilsCrossed,
    },
    {
      label: "Pending Reviews",
      value: stats.pendingDishes.toString(),
      change: "+23.1%",
      trend: "up" as const,
      icon: Clock,
    },
  ] : []

  // Note: These are placeholder data as we don't have analytics tracking yet
  const topAllergens = [
    { name: "Peanuts", searches: 0, percentage: 0 },
    { name: "Gluten", searches: 0, percentage: 0 },
    { name: "Dairy", searches: 0, percentage: 0 },
    { name: "Tree Nuts", searches: 0, percentage: 0 },
    { name: "Shellfish", searches: 0, percentage: 0 },
  ]

  const topRestaurants = [
    { name: "Coming Soon", views: 0, rating: 0 },
  ]

  const recentActivity = auditLogsData?.logs.map(log => ({
    action: log.actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    time: new Date(log.createdAt).toLocaleString(),
    type: log.actionType.includes('VENDOR') ? 'vendor' :
          log.actionType.includes('DISH') ? 'food' : 'system',
  })) || []
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform performance and user engagement</p>
      </div>

      {/* Overview Stats */}
      {statsLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">{stat.change}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Allergen Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Top Allergen Searches
              </CardTitle>
              <CardDescription>Most searched allergens this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Search tracking needs to be implemented to display allergen search analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Restaurants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Top Viewed Restaurants
              </CardTitle>
              <CardDescription>Most popular restaurants this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  View tracking needs to be implemented to display restaurant popularity analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "vendor"
                            ? "bg-blue-500"
                            : activity.type === "food"
                              ? "bg-green-500"
                              : activity.type === "alert"
                                ? "bg-red-500"
                                : "bg-gray-500"
                        }`}
                      />
                      <span>{activity.action}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
