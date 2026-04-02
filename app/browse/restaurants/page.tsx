"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Search,
  MapPin,
  Star,
  Filter,
  Heart,
  Grid,
  List,
  SlidersHorizontal,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"


const businessTypes = ["All Types", "Restaurant", "Cafe", "Food Truck", "Cloud Kitchen", "Catering"]
const states = ["All States", "Kuala Lumpur", "Selangor", "Penang", "Johor", "Perak", "Melaka", "Negeri Sembilan"]
const allergenFilters = [
  { id: "gluten-free", label: "Gluten-Free Options" },
  { id: "dairy-free", label: "Dairy-Free Options" },
  { id: "nut-free", label: "Nut-Free Options" },
  { id: "vegan", label: "Vegan Options" },
  { id: "halal", label: "Halal Certified" },
]

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("rating")
  const [selectedBusinessType, setSelectedBusinessType] = useState("All Types")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch restaurants with filters
  const { data: restaurantsData, isLoading, error } = trpc.consumer.browseRestaurants.useQuery({
    search: searchQuery || undefined,
    businessType: selectedBusinessType === "All Types" ? undefined : selectedBusinessType,
    state: selectedState === "All States" ? undefined : selectedState,
    page: currentPage,
    limit: 12,
  })

  const vendors = restaurantsData?.vendors || []
  const totalRestaurants = restaurantsData?.total || 0
  const totalPages = restaurantsData?.pages || 1

  const filteredRestaurants = vendors.filter((restaurant) =>
    restaurant.businessNameEn.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold mb-2"
        >
          Restaurants
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          {totalRestaurants} restaurants with allergen information near you
        </motion.p>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6"
      >
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>

          {/* Quick Filters */}
          <div className="hidden md:flex items-center gap-2">
            <Select value={selectedBusinessType} onValueChange={(value) => {
              setSelectedBusinessType(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedState} onValueChange={(value) => {
              setSelectedState(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down your search</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <FilterSection
                  allergenFilters={allergenFilters}
                  selectedAllergens={selectedAllergens}
                  setSelectedAllergens={setSelectedAllergens}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="distance">Nearest</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="name">A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:block w-64 shrink-0"
        >
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <FilterSection
                allergenFilters={allergenFilters}
                selectedAllergens={selectedAllergens}
                setSelectedAllergens={setSelectedAllergens}
              />
            </CardContent>
          </Card>
        </motion.aside>

        {/* Restaurant Grid/List */}
        <div className="flex-1">
          {isLoading ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className={viewMode === "list" ? "w-48 h-32" : "h-48 w-full"} />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">Error loading restaurants: {error.message}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link href={`/browse/restaurants/${restaurant.id}`}>
                    <Card
                      className={`overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      <div
                        className={`relative bg-muted ${
                          viewMode === "list" ? "w-48 shrink-0" : "h-48"
                        }`}
                      >
                        <img
                          src={restaurant.imageUrl || "/placeholder.svg"}
                          alt={restaurant.businessNameEn}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        {restaurant.halalCertified && (
                          <Badge className="absolute bottom-3 left-3 bg-green-600">
                            Halal Certified
                          </Badge>
                        )}
                      </div>
                      <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{restaurant.businessNameEn}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.businessType}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">4.5</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span>{restaurant.state}</span>
                          <span>|</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Malaysia
                          </div>
                          <span>|</span>
                          <span>{restaurant._count.dishes} dishes</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            Allergen Menu Available
                          </Badge>
                          {restaurant.halalCertified && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700"
                            >
                              Halal Certified
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {filteredRestaurants.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No restaurants found matching your criteria</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("")
                setSelectedBusinessType("All Types")
                setSelectedState("All States")
                setSelectedAllergens([])
                setCurrentPage(1)
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({
  allergenFilters,
  selectedAllergens,
  setSelectedAllergens,
}: {
  allergenFilters: { id: string; label: string }[]
  selectedAllergens: string[]
  setSelectedAllergens: (value: string[]) => void
}) {
  const toggleAllergen = (id: string) => {
    setSelectedAllergens(
      selectedAllergens.includes(id)
        ? selectedAllergens.filter((a) => a !== id)
        : [...selectedAllergens, id]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Business Type</h4>
        <Select defaultValue="All Types">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">State</h4>
        <Select defaultValue="All States">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Features</h4>
        <div className="space-y-3">
          {allergenFilters.map((filter) => (
            <div key={filter.id} className="flex items-center space-x-2">
              <Checkbox
                id={filter.id}
                checked={selectedAllergens.includes(filter.id)}
                onCheckedChange={() => toggleAllergen(filter.id)}
              />
              <Label htmlFor={filter.id} className="text-sm cursor-pointer">
                {filter.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Certifications</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="halal-certified" />
            <Label htmlFor="halal-certified" className="text-sm cursor-pointer">
              Halal Certified
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="allergen-menu" />
            <Label htmlFor="allergen-menu" className="text-sm cursor-pointer">
              Allergen menu available
            </Label>
          </div>
        </div>
      </div>

      <Button className="w-full">Apply Filters</Button>
    </div>
  )
}
