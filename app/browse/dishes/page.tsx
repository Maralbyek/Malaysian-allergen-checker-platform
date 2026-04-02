"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Star,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { trpc } from "@/lib/trpc"
import { Skeleton } from "@/components/ui/skeleton"


const categories = ["All", "Appetizer", "Main Course", "Dessert", "Beverage", "Soup", "Salad"]
const cuisineTypes = ["All", "Malay", "Chinese", "Indian", "Thai", "Western", "Mixed", "Italian", "Japanese"]

export default function AllDishesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCuisine, setSelectedCuisine] = useState("All")
  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("rating")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch dishes with filters
  const { data: dishesData, isLoading, error } = trpc.consumer.browseDishes.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    cuisineType: selectedCuisine === "All" ? undefined : selectedCuisine,
    excludeAllergens: excludeAllergens.length > 0 ? excludeAllergens : undefined,
    sortBy: sortBy as any,
    page: currentPage,
    limit: 12,
  })

  // Fetch allergens for filters
  const { data: allergens } = trpc.consumer.getAllergens.useQuery()

  const toggleAllergen = (allergenId: string) => {
    setExcludeAllergens((prev) =>
      prev.includes(allergenId) ? prev.filter((a) => a !== allergenId) : [...prev, allergenId]
    )
  }

  const filteredDishes = dishesData?.dishes || []
  const totalDishes = dishesData?.total || 0
  const totalPages = dishesData?.pages || 1

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold mb-2">All Dishes</h1>
        <p className="text-muted-foreground">
          Browse all dishes with detailed allergen information
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCuisine} onValueChange={(value) => {
            setSelectedCuisine(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Cuisine" />
            </SelectTrigger>
            <SelectContent>
              {cuisineTypes.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Allergen Filters */}
        {allergens && allergens.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Exclude allergens:
            </span>
            {allergens.map((allergen) => (
              <Button
                key={allergen.id}
                variant={excludeAllergens.includes(allergen.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAllergen(allergen.id)}
                className="rounded-full"
              >
                {allergen.icon} {allergen.nameEn}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredDishes.length} of {totalDishes} dishes
        </p>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {/* Dishes Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
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
          <p className="text-red-600 mb-4">Error loading dishes: {error.message}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/browse/dishes/${dish.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="relative h-48">
                    <Image
                      src={dish.imageUrl || "/placeholder.svg"}
                      alt={dish.nameEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{dish.rating || 4.5}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold group-hover:text-accent transition-colors">
                          {dish.nameEn}
                        </h3>
                        <p className="text-sm text-muted-foreground">{dish.vendor.businessNameEn}</p>
                      </div>
                      <span className="font-semibold text-accent">${dish.price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Clock className="h-4 w-4" />
                      {dish.preparationTime} min
                    </div>

                    {/* Allergens */}
                    {dish.allergenMappings.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 text-sm text-orange-600 mb-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Contains:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dish.allergenMappings
                            .filter(mapping => mapping.contains === 'YES')
                            .slice(0, 3)
                            .map((mapping) => (
                              <Badge
                                key={mapping.allergen.id}
                                variant="outline"
                                className="text-xs border-orange-200 bg-orange-50 text-orange-700"
                              >
                                {mapping.allergen.icon} {mapping.allergen.nameEn}
                              </Badge>
                            ))}
                          {dish.allergenMappings.filter(mapping => mapping.contains === 'YES').length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{dish.allergenMappings.filter(mapping => mapping.contains === 'YES').length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Safe For - calculated from missing allergens */}
                    {dish.allergenMappings.filter(mapping => mapping.contains === 'YES').length === 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-green-600 mb-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Free from common allergens</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filteredDishes.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No dishes found matching your criteria</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("")
            setSelectedCategory("All")
            setSelectedCuisine("All")
            setExcludeAllergens([])
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
  )
}
