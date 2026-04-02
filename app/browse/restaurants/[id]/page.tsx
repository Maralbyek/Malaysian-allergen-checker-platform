"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { useParams } from "next/navigation"
import { toast } from "sonner"

const categories = ["All", "Appetizer", "Main Course", "Dessert"]

export default function RestaurantDetailPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("menu")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Fetch restaurant details
  const { data: restaurant, isLoading, error } = trpc.consumer.getRestaurant.useQuery({
    id: restaurantId,
  })

  // Fetch restaurant's dishes
  const { data: dishesData, isLoading: dishesLoading } = trpc.consumer.browseDishes.useQuery({
    limit: 50,
  })

  const dishes = dishesData?.dishes?.filter((dish: any) => dish.vendorId === restaurantId) || []

  if (isLoading) {
    return (
      <div className="pb-12">
        <div className="relative h-72 md:h-96 bg-muted">
          <Skeleton className="h-full w-full" />
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="-mt-12 relative z-10">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Restaurant not found</h2>
            <p className="text-muted-foreground mb-4">
              The restaurant you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/browse/restaurants">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Restaurants
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredMenu =
    selectedCategory === "All"
      ? dishes
      : dishes.filter((item) => item.category === selectedCategory)

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-muted">
        <img
          src={restaurant.imageUrl || "/placeholder.svg"}
          alt={restaurant.businessNameEn}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="secondary" size="icon" asChild className="rounded-full">
            <Link href="/browse/restaurants">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-16 relative z-10"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold">{restaurant.businessNameEn}</h1>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Authentic {restaurant.businessType} cuisine serving traditional dishes with fresh ingredients. Our kitchen is trained to handle food allergies with care.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold">{4.8}</span> {/* Mock rating */}
                      <span className="text-muted-foreground">({Math.floor(Math.random() * 100) + 200} reviews)</span>
                    </div>
                    <Badge variant="outline">{restaurant.businessType}</Badge>
                    <Badge variant="outline">$$</Badge>
                    <Badge variant="outline">{restaurant.state}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {'11:00 AM - 10:00 PM'} {/* Mock hours */}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {'Not available'}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Safe For Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Dairy-Free Options
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Gluten-Free Options
                </Badge>
                {restaurant.halalCertified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Halal Certified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Allergen Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <Alert>
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Allergen Policy</AlertTitle>
            <AlertDescription>
              Our staff is trained to handle food allergies. Please inform your server of any allergies before ordering. We have a dedicated allergen menu available upon request.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Menu</h2>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter by Allergens
            </Button>
          </div>

          <Tabs defaultValue="All" className="space-y-6">
            <TabsList className="bg-muted/50">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {filteredMenu.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/browse/dishes/${item.id}`}>
                      <Card className="overflow-hidden hover:shadow-md transition-all group">
                        <div className="flex">
                          <div className="relative w-32 h-32 bg-muted shrink-0">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.nameEn}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {Math.random() > 0.5 && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4 flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold">{item.nameEn}</h3>
                              <span className="font-bold text-accent">{item.price}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.descriptionEn}
                            </p>

                            {item.allergenMappings && item.allergenMappings.filter((mapping: any) => mapping.contains === 'YES').length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                                <span className="text-xs text-destructive truncate">
                                  Contains: {item.allergenMappings.filter((mapping: any) => mapping.contains === 'YES').map((mapping: any) => mapping.allergen.nameEn).join(", ")}
                                </span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1">
                              {item.allergenMappings
                                .filter((mapping: any) => mapping.contains === 'YES')
                                .slice(0, 3)
                                .map((mapping: any) => (
                                  <span
                                    key={mapping.allergen.id}
                                    className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
                                  >
                                    {mapping.allergen.icon} {mapping.allergen.nameEn}
                                  </span>
                                ))}
                              {item.allergenMappings?.filter((mapping: any) => mapping.contains === 'YES').length > 3 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  +{item.allergenMappings.filter((mapping: any) => mapping.contains === 'YES').length - 3}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
