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
  Mail,
  Phone,
  MapPin,
  Calendar,
  Store,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    icon: AlertCircle,
    className: "bg-yellow-100 text-yellow-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
}

export default function AdminVendorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  
  // Fetch vendors with filters
  const { data: vendorsData, isLoading, error } = trpc.admin.getAllVendors.useQuery({
    status: statusFilter as any,
    page: currentPage,
    limit: 20,
  })
  
  const vendors = vendorsData?.vendors || []
  const totalVendors = vendorsData?.total || 0
  const totalPages = vendorsData?.pages || 1
  
  // Mutations
  const approveVendorMutation = trpc.admin.approveVendor.useMutation()
  const rejectVendorMutation = trpc.admin.rejectVendor.useMutation()
  
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.businessNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })
  
  const handleApprove = async (vendorId: string) => {
    try {
      await approveVendorMutation.mutateAsync({ vendorId })
      toast.success("Vendor approved successfully")
      setViewDialogOpen(false)
      // Refetch data
      window.location.reload()
    } catch (error) {
      toast.error("Failed to approve vendor")
    }
  }
  
  const handleReject = async (vendorId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    
    try {
      await rejectVendorMutation.mutateAsync({ vendorId, reason: rejectionReason })
      toast.success("Vendor rejected")
      setRejectDialogOpen(false)
      setRejectionReason("")
      window.location.reload()
    } catch (error) {
      toast.error("Failed to reject vendor")
    }
  }

  const handleView = (vendor: any) => {
    setSelectedVendor(vendor)
    setViewDialogOpen(true)
  }

  const handleRejectDialog = (vendor: any) => {
    setSelectedVendor(vendor)
    setRejectDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold"
        >
          Vendor Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Review and manage vendor applications
        </motion.p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ALL" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="ALL">All Vendors ({totalVendors})</TabsTrigger>
            <TabsTrigger value="PENDING">
              Pending ({vendors.filter((v) => v.status === "PENDING").length})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              Approved ({vendors.filter((v) => v.status === "APPROVED").length})
            </TabsTrigger>
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
                    placeholder="Search vendors..."
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
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendors Table */}
        <TabsContent value="ALL" className="mt-0">
          <VendorsTable
            vendors={filteredVendors}
            onView={handleView}
            onReject={handleRejectDialog}
            onApprove={handleApprove}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="PENDING" className="mt-0">
          <VendorsTable
            vendors={filteredVendors.filter((v) => v.status === "PENDING")}
            onView={handleView}
            onReject={handleRejectDialog}
            onApprove={handleApprove}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="APPROVED" className="mt-0">
          <VendorsTable
            vendors={filteredVendors.filter((v) => v.status === "APPROVED")}
            onView={handleView}
            onReject={handleRejectDialog}
            onApprove={handleApprove}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* View Vendor Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>Review vendor information before approval</DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedVendor.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl">
                    {selectedVendor.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedVendor.businessNameEn}</h3>
                  <Badge variant="outline">{selectedVendor.businessType}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedVendor.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedVendor.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedVendor.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applied On</p>
                    <p className="font-medium">{new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedVendor.status === "PENDING" && (
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
                    onClick={() => handleApprove(selectedVendor.id)}
                    disabled={approveVendorMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Vendor
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
            <DialogTitle>Reject Vendor</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedVendor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
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
              onClick={() => handleReject(selectedVendor.id)}
              disabled={rejectVendorMutation.isPending}
            >
              Reject Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VendorsTable({
  vendors,
  onView,
  onReject,
  onApprove,
  isLoading,
}: {
  vendors: any[]
  onView: (vendor: any) => void
  onReject: (vendor: any) => void
  onApprove: (vendorId: string) => void
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
                  <TableHead className="w-[300px]">Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Foods</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-8" /></TableCell>
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
                <TableHead className="w-[300px]">Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Foods</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {vendors.map((vendor: any, index: number) => {
                  const statusConfig = {
                    APPROVED: {
                      label: "Approved",
                      icon: CheckCircle2,
                      className: "bg-green-100 text-green-700",
                    },
                    PENDING: {
                      label: "Pending",
                      icon: AlertCircle,
                      className: "bg-yellow-100 text-yellow-700",
                    },
                    REJECTED: {
                      label: "Rejected",
                      icon: XCircle,
                      className: "bg-red-100 text-red-700",
                    },
                  }
                  const status = statusConfig[vendor.status as keyof typeof statusConfig]
                  const StatusIcon = status?.icon || AlertCircle
                  return (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={vendor.imageUrl || "/placeholder.svg"} />
                            <AvatarFallback>{vendor.businessNameEn?.[0] || 'V'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{vendor.businessNameEn}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendor.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.businessType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{vendor.phone || 'Not provided'}</div>
                          <div className="text-muted-foreground truncate max-w-[200px]">
                            {vendor.address || 'Not provided'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status?.className}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {vendor._count?.dishes || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {vendor.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => onReject(vendor)}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                onClick={() => onApprove(vendor.id)}
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
                              <DropdownMenuItem onClick={() => onView(vendor)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend Vendor
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
          {vendors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No vendors found</h3>
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
