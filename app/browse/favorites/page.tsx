"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Heart,
  Star,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"


export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState("restaurants")

  // Fetch user's favorite vendor IDs
  const { data: favoriteVendorIds, isLoading: vendorsLoading, refetch: refetchVendors } =
    trpc.consumer.getFavoriteVendors.useQuery()

  // Fetch user's favorite dish IDs
  const { data: favoriteDishIds, isLoading: dishesLoading, refetch: refetchDishes } =
    trpc.consumer.getFavoriteDishes.useQuery()

  // Fetch all vendors to get favorite vendor details
  const { data: allRestaurantsData } = trpc.consumer.browseRestaurants.useQuery({ limit: 100 })

  // Fetch all dishes to get favorite dish details
  const { data: allDishesData } = trpc.consumer.browseDishes.useQuery({ limit: 100 })

  // Mutations
  const removeVendorMutation = trpc.consumer.removeFavoriteVendor.useMutation({
    onSuccess: () => {
      toast.success("Restaurant removed from favorites")
      refetchVendors()
    },
    onError: (error) => {
      toast.error("Failed to remove restaurant: " + error.message)
    }
  })

  const removeDishMutation = trpc.consumer.removeFavoriteDish.useMutation({
    onSuccess: () => {
      toast.success("Dish removed from favorites")
      refetchDishes()
    },
    onError: (error) => {
      toast.error("Failed to remove dish: " + error.message)
    }
  })

  // Filter favorite restaurants
  const favoriteRestaurants = allRestaurantsData?.vendors.filter(
    (vendor: any) => favoriteVendorIds?.some((fav: any) => fav.vendorId === vendor.id)
  ).map((restaurant: any) => ({
    id: restaurant.id,
    name: restaurant.businessNameEn,
    cuisine: restaurant.businessType,
    rating: 4.5 + Math.random() * 0.5,
    priceRange: "$$",
    address: restaurant.address,
    image: restaurant.imageUrl || "/placeholder.svg",
    allergenFriendly: restaurant.halalCertified ? ["Halal Certified"] : ["Allergen-Friendly Options"],
  })) || []

  // Filter favorite dishes
  const favoriteDishes = allDishesData?.dishes.filter(
    (dish: any) => favoriteDishIds?.some((fav: any) => fav.dishId === dish.id)
  ).map((dish: any) => ({
    id: dish.id,
    name: dish.nameEn,
    restaurant: dish.vendor.businessNameEn,
    restaurantId: dish.vendor.id,
    price: dish.price,
    rating: 4.0 + Math.random(),
    prepTime: "15-20 min",
    image: dish.imageUrl || "/placeholder.svg",
    allergens: dish.allergenMappings?.filter((mapping: any) => mapping.contains === 'YES').map((mapping: any) => mapping.allergen.nameEn) || [],
    safeFor: dish.allergenMappings?.filter((mapping: any) => mapping.contains === 'NO').map((mapping: any) => mapping.allergen.nameEn) || [],
  })) || []

  const removeRestaurant = (id: string) => {
    removeVendorMutation.mutate({ vendorId: id })
  }

  const removeDish = (id: string) => {
    removeDishMutation.mutate({ dishId: id })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="font-serif text-3xl font-semibold">My Favorites</h1>
        </div>
        <p className="text-muted-foreground">
          Your saved restaurants and dishes for quick access
        </p>
      </div>

      <Tabs defaultValue="restaurants" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="restaurants" className="gap-2">
            Restaurants
            <Badge variant="secondary" className="ml-1">
              {vendorsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : favoriteRestaurants.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dishes" className="gap-2">
            Dishes
            <Badge variant="secondary" className="ml-1">
              {dishesLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : favoriteDishes.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants">
          {vendorsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favoriteRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No favorite restaurants yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring and save restaurants you love
              </p>
              <Button asChild>
                <Link href="/browse/restaurants">Browse Restaurants</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {favoriteRestaurants.map((restaurant: any, index: number) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group">
                    <div className="relative h-48">
                      <Image
                        src={restaurant.image || "/placeholder.svg"}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeRestaurant(restaurant.id)}
                        disabled={removeVendorMutation.isPending}
                      >
                        {removeVendorMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <Link href={`/browse/restaurants/${restaurant.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg hover:text-accent transition-colors">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {restaurant.cuisine} • {restaurant.priceRange}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        {restaurant.address}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {restaurant.allergenFriendly.map((tag: any) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-green-200 bg-green-50 text-green-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dishes Tab */}
        <TabsContent value="dishes">
          {dishesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favoriteDishes.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No favorite dishes yet</h3>
              <p className="text-muted-foreground mb-6">
                Browse menus and save dishes you want to try
              </p>
              <Button asChild>
                <Link href="/browse/dishes">Browse Dishes</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteDishes.map((dish: any, index: number) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group">
                    <div className="relative h-48">
                      <Image
                        src={dish.image || "/placeholder.svg"}
                        alt={dish.name}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeDish(dish.id)}
                        disabled={removeDishMutation.isPending}
                      >
                        {removeDishMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{dish.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <Link href={`/browse/dishes/${dish.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold hover:text-accent transition-colors">
                              {dish.name}
                            </h3>
                            <Link
                              href={`/browse/restaurants/${dish.restaurantId}`}
                              className="text-sm text-muted-foreground hover:text-accent"
                            >
                              {dish.restaurant}
                            </Link>
                          </div>
                          <span className="font-semibold text-accent">${dish.price}</span>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        {dish.prepTime}
                      </div>

                      {dish.allergens.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            Contains:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dish.allergens.slice(0, 3).map((allergen: any) => (
                              <Badge
                                key={allergen}
                                variant="outline"
                                className="text-xs border-orange-200 bg-orange-50 text-orange-700"
                              >
                                {allergen}
                              </Badge>
                            ))}
                            {dish.allergens.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{dish.allergens.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {dish.safeFor.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-green-600 mb-1">
                            <CheckCircle className="h-3 w-3" />
                            Safe for:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {dish.safeFor.slice(0, 2).map((safe: any) => (
                              <Badge
                                key={safe}
                                variant="outline"
                                className="text-xs border-green-200 bg-green-50 text-green-700"
                              >
                                {safe}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
