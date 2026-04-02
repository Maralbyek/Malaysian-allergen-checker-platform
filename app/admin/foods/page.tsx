"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  UtensilsCrossed,
  Store,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"


const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
}

export default function AdminFoodsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // Fetch dishes with filters
  const { data: dishesData, isLoading, error } = trpc.admin.getAllDishes.useQuery({
    status: statusFilter as any,
    page: currentPage,
    limit: 20,
  })
  
  const dishes = dishesData?.dishes || []
  const totalDishes = dishesData?.total || 0
  const totalPages = dishesData?.pages || 1
  
  // Mutations
  const approveDishMutation = trpc.admin.approveDish.useMutation()
  const rejectDishMutation = trpc.admin.rejectDish.useMutation()
  
  const filteredFoods = dishes.filter((dish: any) => {
    const matchesSearch =
      dish.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.vendor.businessNameEn.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })
  
  const handleApprove = async (dishId: string) => {
    try {
      await approveDishMutation.mutateAsync({ dishId })
      toast.success("Dish approved successfully")
      setViewDialogOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to approve dish")
    }
  }
  
  const handleReject = async (dishId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    
    try {
      await rejectDishMutation.mutateAsync({ dishId, reason: rejectionReason })
      toast.success("Dish rejected")
      setRejectDialogOpen(false)
      setRejectionReason("")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to reject dish")
    }
  }

  const handleView = (food: any) => {
    setSelectedFood(food)
    setViewDialogOpen(true)
  }

  const handleRejectDialog = (food: any) => {
    setSelectedFood(food)
    setRejectDialogOpen(true)
  }
  
  const pendingCount = dishes.filter((f: any) => f.status === "PENDING").length
  const approvedCount = dishes.filter((f: any) => f.status === "APPROVED").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold"
        >
          Food Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Review and approve food items with allergen information
        </motion.p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ALL" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="ALL">All Foods ({totalDishes})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({approvedCount})</TabsTrigger>
          </TabsList>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search foods or vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Foods Table */}
        <TabsContent value="ALL" className="mt-0">
          <FoodsTable
            foods={filteredFoods}
            onView={handleView}
            onReject={handleRejectDialog}
            onApprove={handleApprove}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="PENDING" className="mt-0">
          <FoodsTable
            foods={filteredFoods.filter((f: any) => f.status === "PENDING")}
            onView={handleView}
            onReject={handleRejectDialog}
            onApprove={handleApprove}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="APPROVED" className="mt-0">
          <FoodsTable
            foods={filteredFoods.filter((f: any) => f.status === "APPROVED")}
            onView={handleView}
            onReject={handleRejectDialog}
            onApprove={handleApprove}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* View Food Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Food Details</DialogTitle>
            <DialogDescription>
              Review food information and allergens before approval
            </DialogDescription>
          </DialogHeader>
          {selectedFood && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden">
                  <img
                    src={selectedFood.imageUrl || "/placeholder.svg"}
                    alt={selectedFood.nameEn}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedFood.nameEn}</h3>
                  <p className="text-muted-foreground">{selectedFood.descriptionEn}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedFood.vendor?.businessNameEn}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${selectedFood.price}</div>
                  <Badge
                    variant="secondary"
                    className={
                      selectedFood.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      selectedFood.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      selectedFood.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedFood.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Allergen Information
                </h4>

                {selectedFood.allergenMappings && selectedFood.allergenMappings.length > 0 ? (
                  <div className="space-y-4">
                    {/* Contains Allergens */}
                    {selectedFood.allergenMappings.filter((m: any) => m.contains === 'YES').length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-destructive mb-2">Contains:</p>
                        <div className="space-y-2">
                          {selectedFood.allergenMappings
                            .filter((mapping: any) => mapping.contains === 'YES')
                            .map((mapping: any) => (
                              <div
                                key={mapping.allergen.id}
                                className="flex items-start gap-2 bg-destructive/5 p-2 rounded-lg"
                              >
                                <Badge
                                  variant="destructive"
                                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 shrink-0"
                                >
                                  {mapping.allergen.icon} {mapping.allergen.nameEn}
                                </Badge>
                                {mapping.notes && (
                                  <span className="text-sm text-muted-foreground">
                                    {mapping.notes}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* May Contain Allergens */}
                    {selectedFood.allergenMappings.filter((m: any) => m.contains === 'MAY_CONTAIN').length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-yellow-700 mb-2">May Contain:</p>
                        <div className="space-y-2">
                          {selectedFood.allergenMappings
                            .filter((mapping: any) => mapping.contains === 'MAY_CONTAIN')
                            .map((mapping: any) => (
                              <div
                                key={mapping.allergen.id}
                                className="flex items-start gap-2 bg-yellow-50 p-2 rounded-lg"
                              >
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shrink-0"
                                >
                                  {mapping.allergen.icon} {mapping.allergen.nameEn}
                                </Badge>
                                {mapping.notes && (
                                  <span className="text-sm text-muted-foreground">
                                    {mapping.notes}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    No allergen information declared
                  </p>
                )}
              </div>

              {selectedFood.status === "REJECTED" && selectedFood.rejectionReason && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-medium text-destructive mb-1">Rejection Reason</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedFood.rejectionReason}
                  </p>
                </div>
              )}

              {selectedFood.status === "PENDING" && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false)
                      setRejectDialogOpen(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedFood.id)}
                    disabled={approveDishMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {approveDishMutation.isPending ? "Approving..." : "Approve Food"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Food Item</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &quot;{selectedFood?.nameEn}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection (e.g., incomplete allergen information, unclear ingredients)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReject(selectedFood.id)}
              disabled={rejectDishMutation.isPending}
            >
              Reject Food
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FoodsTable({
  foods,
  onView,
  onReject,
  onApprove,
  isLoading,
}: {
  foods: any[]
  onView: (food: any) => void
  onReject: (food: any) => void
  onApprove: (dishId: string) => void
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Food Item</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Allergens</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Food Item</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Allergens</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {foods.map((food: any, index: number) => {
                  const statusConfig = {
                    APPROVED: {
                      label: "Approved",
                      icon: CheckCircle2,
                      className: "bg-green-100 text-green-700",
                    },
                    PENDING: {
                      label: "Pending",
                      icon: Clock,
                      className: "bg-yellow-100 text-yellow-700",
                    },
                    REJECTED: {
                      label: "Rejected",
                      icon: XCircle,
                      className: "bg-red-100 text-red-700",
                    },
                    DRAFT: {
                      label: "Draft",
                      icon: AlertTriangle,
                      className: "bg-gray-100 text-gray-700",
                    },
                  }
                  const status = statusConfig[food.status as keyof typeof statusConfig]
                  const StatusIcon = status?.icon || AlertCircle
                  return (
                    <motion.tr
                      key={food.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                            <img
                              src={food.imageUrl || "/placeholder.svg"}
                              alt={food.nameEn}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{food.nameEn}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {food.descriptionEn}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{food.vendor?.businessNameEn}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {food.allergenMappings && food.allergenMappings.length > 0 ? (
                            food.allergenMappings
                              .filter((mapping: any) => mapping.contains === 'YES')
                              .slice(0, 2)
                              .map((mapping: any) => (
                                <span
                                  key={mapping.allergen.id}
                                  className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
                                >
                                  {mapping.allergen.icon} {mapping.allergen.nameEn}
                                </span>
                              ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None declared
                            </span>
                          )}
                          {food.allergenMappings && food.allergenMappings.filter((mapping: any) => mapping.contains === 'YES').length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              +{food.allergenMappings.filter((mapping: any) => mapping.contains === 'YES').length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${food.price}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status?.className}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(food.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {food.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => onReject(food)}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                onClick={() => onApprove(food.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(food)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Remove Food
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
          {foods.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No foods found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
