"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"


const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  rejected: {
    label: "Rejected",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
}

export default function VendorFoodsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<any>(null)

  // Fetch vendor's dishes
  const { data: dishes = [], isLoading, error, refetch } = trpc.vendor.getMyDishes.useQuery({
    status: statusFilter as any,
  })

  // Delete mutation
  const deleteDishMutation = trpc.vendor.deleteDish.useMutation({
    onSuccess: () => {
      toast.success("Dish deleted successfully")
      refetch()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error("Failed to delete dish: " + error.message)
    }
  })
  
  const filteredFoods = dishes.filter((dish: any) => {
    const matchesSearch =
      dish.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || dish.status === statusFilter
    const matchesCategory = categoryFilter === "all" || dish.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })
  
  const handleDelete = (food: any) => {
    setSelectedFood(food)
    setDeleteDialogOpen(true)
  }

  const handleViewDetails = (food: any) => {
    setSelectedFood(food)
    setViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif font-bold"
          >
            My Foods
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Manage your menu items and allergen information
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
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Appetizer">Appetizer</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Soup">Soup</SelectItem>
                    <SelectItem value="Salad">Salad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Foods Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">Error loading foods</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Food Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Allergens</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredFoods.map((food: any, index: number) => {
                      const statusConfig = {
                        APPROVED: {
                          label: "Approved",
                          icon: CheckCircle2,
                          className: "bg-green-100 text-green-700 hover:bg-green-100",
                        },
                        PENDING: {
                          label: "Pending",
                          icon: Clock,
                          className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                        },
                        REJECTED: {
                          label: "Rejected",
                          icon: AlertTriangle,
                          className: "bg-red-100 text-red-700 hover:bg-red-100",
                        },
                        DRAFT: {
                          label: "Draft",
                          icon: ChevronDown,
                          className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
                        },
                      }
                      const status = statusConfig[food.status as keyof typeof statusConfig]
                      const StatusIcon = status?.icon || ChevronDown
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
                          <Badge variant="outline">{food.category}</Badge>
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
                              <span className="text-xs text-muted-foreground">None</span>
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(food)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/vendor/foods/${food.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(food)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
            )}
            {filteredFoods.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No foods found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
                <Button asChild className="gap-2">
                  <Link href="/vendor/foods/new">
                    <Plus className="h-4 w-4" />
                    Add Your First Food
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedFood?.nameEn}</DialogTitle>
            <DialogDescription>{selectedFood?.nameMs}</DialogDescription>
          </DialogHeader>
          {selectedFood && (
            <div className="space-y-6">
              {/* Image */}
              {selectedFood.imageUrl && (
                <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedFood.imageUrl}
                    alt={selectedFood.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <Badge variant="outline" className="mt-1">{selectedFood.category}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Cuisine Type</h4>
                  <p className="mt-1">{selectedFood.cuisineType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                  <p className="mt-1 font-semibold">${selectedFood.price}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge
                    variant="secondary"
                    className={selectedFood.status === 'APPROVED' ? "bg-green-100 text-green-700" : selectedFood.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}
                  >
                    {selectedFood.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Preparation Time</h4>
                  <p className="mt-1">{selectedFood.preparationTime} mins</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Serving Size</h4>
                  <p className="mt-1">{selectedFood.servingSize}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Calories</h4>
                  <p className="mt-1">{selectedFood.calories} kcal</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Dietary Tags</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedFood.isVegetarian && <Badge variant="outline">Vegetarian</Badge>}
                    {selectedFood.isVegan && <Badge variant="outline">Vegan</Badge>}
                    {selectedFood.isHalal && <Badge variant="outline">Halal</Badge>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description (English)</h4>
                <p className="text-sm">{selectedFood.descriptionEn}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description (Malay)</h4>
                <p className="text-sm">{selectedFood.descriptionMs}</p>
              </div>

              {/* Allergens */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Allergen Information</h4>
                {selectedFood.allergenMappings && selectedFood.allergenMappings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFood.allergenMappings.map((mapping: any) => (
                      <div
                        key={mapping.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{mapping.allergen.icon}</span>
                          <div>
                            <p className="font-medium">{mapping.allergen.nameEn}</p>
                            <p className="text-sm text-muted-foreground">{mapping.allergen.nameMs}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            mapping.contains === 'YES'
                              ? "bg-red-100 text-red-700"
                              : mapping.contains === 'MAY_CONTAIN'
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }
                        >
                          {mapping.contains === 'YES' ? 'Contains' : mapping.contains === 'MAY_CONTAIN' ? 'May Contain' : 'Does Not Contain'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No allergen information available</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Food Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedFood?.nameEn}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteDishMutation.isPending}
              onClick={() => {
                if (selectedFood?.id) {
                  deleteDishMutation.mutate({ id: selectedFood.id })
                }
              }}
            >
              {deleteDishMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
