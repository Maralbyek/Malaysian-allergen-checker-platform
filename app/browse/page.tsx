"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Search,
  MapPin,
  Star,
  AlertTriangle,
  ChevronRight,
  Filter,
  Heart,
  TrendingUp,
  Utensils,
  Leaf,
  Fish,
  Wheat,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"


export default function BrowsePage() {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch real data
  const { data: allergensData } = trpc.consumer.getAllergens.useQuery()
  const { data: restaurantsData, isLoading: restaurantsLoading } = trpc.consumer.browseRestaurants.useQuery({ limit: 4 })
  const { data: dishesData, isLoading: dishesLoading } = trpc.consumer.browseDishes.useQuery({ limit: 4, sortBy: 'newest' })
  
  // Transform data for display
  const popularAllergens = allergensData?.slice(0, 4).map((allergen: any) => ({
    id: allergen.id,
    label: `${allergen.nameEn}-Free`,
    icon: allergen.icon || '⚠️',
    color: "bg-orange-100 text-orange-700"
  })) || []
  
  const featuredRestaurants = restaurantsData?.vendors.slice(0, 4).map((restaurant: any) => ({
    id: restaurant.id,
    name: restaurant.businessNameEn,
    image: restaurant.imageUrl || "/placeholder.svg",
    cuisine: restaurant.businessType,
    rating: 4.5 + Math.random() * 0.5, // Mock rating
    reviewCount: Math.floor(Math.random() * 200) + 50,
    distance: `${(Math.random() * 2 + 0.5).toFixed(1)} mi`,
    safeFor: restaurant.halalCertified ? ["Halal Certified"] : [],
    featured: true,
  })) || []
  
  const trendingDishes = dishesData?.dishes.slice(0, 4).map((dish: any) => ({
    id: dish.id,
    name: dish.nameEn,
    restaurant: dish.vendor.businessNameEn,
    image: dish.imageUrl || "/placeholder.svg",
    price: `$${dish.price}`,
    rating: 4.0 + Math.random(),
    allergens: dish.allergenMappings?.filter((mapping: any) => mapping.contains === 'YES').map((mapping: any) => mapping.allergen.nameEn) || [],
    safeFor: dish.allergenMappings?.filter((mapping: any) => mapping.contains === 'NO').map((mapping: any) => mapping.allergen.nameEn) || [],
  })) || []
  
  const categories = [
    { name: "All", icon: Utensils, count: dishesData?.total || 0 },
    { name: "Vegan", icon: Leaf, count: Math.floor((dishesData?.total || 0) * 0.3) },
    { name: "Seafood", icon: Fish, count: Math.floor((dishesData?.total || 0) * 0.25) },
    { name: "Gluten-Free", icon: Wheat, count: Math.floor((dishesData?.total || 0) * 0.4) },
  ]

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-accent/5 to-background py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Find Safe Foods Near You
            </h1>
            <p className="text-muted-foreground mb-8">
              Browse restaurants and dishes with detailed allergen information.
              Dine with confidence.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search restaurants or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg rounded-full shadow-lg border-2"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 px-6">
                Search
              </Button>
            </div>
          </motion.div>

          {/* Quick Allergen Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >
            {popularAllergens.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen.id)
              return (
                <button
                  key={allergen.id}
                  onClick={() => toggleAllergen(allergen.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-muted bg-background hover:border-muted-foreground/30"
                  }`}
                >
                  <span>{allergen.icon}</span>
                  <span className="text-sm font-medium">{allergen.label}</span>
                </button>
              )
            })}
            <Button variant="outline" className="rounded-full gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-12 mt-8">
        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/browse/dishes?category=${category.name.toLowerCase()}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                        <category.icon className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} dishes</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold">Featured Restaurants</h2>
              <p className="text-muted-foreground">Top-rated places with allergen-safe options</p>
            </div>
            <Button variant="ghost" asChild className="gap-1">
              <Link href="/browse/restaurants">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantsLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : (
              featuredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/browse/restaurants/${restaurant.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
                      <div className="relative h-40 bg-muted">
                        <img
                          src={restaurant.imageUrl || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {restaurant.featured && (
                          <Badge className="absolute top-3 left-3 bg-accent">Featured</Badge>
                        )}
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{restaurant.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {restaurant.distance}
                          </div>
                          <span>|</span>
                          <span>{restaurant.reviewCount} reviews</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.safeFor.map((safe: any) => (
                            <Badge
                              key={safe}
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700"
                            >
                              {safe}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Trending Dishes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Trending Safe Dishes
              </h2>
              <p className="text-muted-foreground">Popular allergen-friendly options this week</p>
            </div>
            <Button variant="ghost" asChild className="gap-1">
              <Link href="/browse/dishes">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishesLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : (
              trendingDishes.map((dish, index) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link href={`/browse/dishes/${dish.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
                      <div className="relative h-40 bg-muted">
                        <img
                          src={dish.image || "/placeholder.svg"}
                          alt={dish.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">
                          {dish.price}
                        </div>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-3 left-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold">{dish.name}</h3>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{dish.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{dish.restaurant}</p>

                        {dish.allergens.length > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                            <span className="text-xs text-destructive">
                              Contains: {dish.allergens.join(", ")}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {dish.safeFor.slice(0, 2).map((safe: any) => (
                            <Badge
                              key={safe}
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700"
                            >
                              {safe}
                            </Badge>
                          ))}
                          {dish.safeFor.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{dish.safeFor.length - 2}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-none">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-2">
                    Set Up Your Allergy Profile
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Get personalized recommendations and automatic warnings for foods that
                    contain your allergens.
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/browse/profile">Manage My Allergies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
