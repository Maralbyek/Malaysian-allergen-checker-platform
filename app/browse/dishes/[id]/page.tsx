"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Store,
  Clock,
  Flame,
  Leaf,
  Info,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { useParams } from "next/navigation"
import { toast } from "sonner"


export default function DishDetailPage() {
  const params = useParams()
  const dishId = params.id as string
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Fetch dish details
  const { data: dish, isLoading, error } = trpc.consumer.getDish.useQuery({
    id: dishId,
  })

  // Fetch user's allergen profile
  const { data: userProfile } = trpc.consumer.getUserAllergenProfile.useQuery()

  // Fetch all allergens to map IDs to names
  const { data: allergens } = trpc.consumer.getAllergens.useQuery()

  // Get user allergen names from profile
  const userAllergens = userProfile?.map((profile: any) => {
    const allergen = allergens?.find((a: any) => a.id === profile.allergenId)
    return allergen?.nameEn
  }).filter(Boolean) || []
  
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
  
  if (error || !dish) {
    return (
      <div className="pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Dish not found</h2>
            <p className="text-muted-foreground mb-4">
              The dish you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/browse/dishes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dishes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  const hasUserAllergen = dish.allergenMappings?.some((mapping: any) =>
    userAllergens.includes(mapping.allergen.nameEn) && mapping.contains === 'YES'
  )
  
  const matchingAllergens = dish.allergenMappings?.filter((mapping: any) =>
    userAllergens.includes(mapping.allergen.nameEn) && mapping.contains === 'YES'
  ) || []

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 bg-muted">
        <img
          src={dish.imageUrl || "/placeholder.svg"}
          alt={dish.nameEn}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="secondary" size="icon" asChild className="rounded-full">
            <Link href="/browse">
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
        <div className="absolute bottom-4 right-4">
          <div className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 text-xl font-bold">
            ${dish.price}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-12 relative z-10"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">
                    {dish.category}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">{dish.nameEn}</h1>
                  <p className="text-muted-foreground mb-4">{dish.descriptionEn}</p>

                  <Link
                    href={`/browse/restaurants/${dish.vendor.id}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Store className="h-4 w-4" />
                    <span>{dish.vendor.businessNameEn}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{4.8}</span> {/* Mock rating for now */}
                    </div>
                  </Link>
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{4.5}</span> {/* Mock rating for now */}
                    <span className="text-muted-foreground">({Math.floor(Math.random() * 100) + 50} reviews)</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {'15-20 min'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      {dish.calories || 400} cal
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Safe For Badges - Based on allergen mappings */}
              <div className="flex flex-wrap gap-2">
                {dish.allergenMappings && (
                  <>
                    {dish.allergenMappings.filter((mapping: any) => mapping.contains === 'NO').length > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Dairy-Free Available
                      </Badge>
                    )}
                    {dish.allergenMappings.filter((mapping: any) => mapping.contains === 'NO').length > 1 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Multiple Allergen-Free Options
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Allergen Warning */}
        {hasUserAllergen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Allergen Warning</AlertTitle>
              <AlertDescription>
                This dish contains allergens in your profile:{" "}
                <strong>{matchingAllergens.map((a: any) => a.allergen.nameEn).join(", ")}</strong>.
                Please inform the restaurant of your allergies before ordering.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Allergens & Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Allergen Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Allergen Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dish.allergenMappings && dish.allergenMappings.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dish.allergenMappings
                      .filter((mapping: any) => mapping.contains === 'YES')
                      .map((mapping: any) => {
                        const isUserAllergen = userAllergens.includes(mapping.allergen.nameEn)
                        return (
                          <div
                            key={mapping.allergen.id}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              isUserAllergen
                                ? "border-destructive bg-destructive/5"
                                : "border-muted"
                            }`}
                          >
                            <span className="text-2xl">{mapping.allergen.icon || '⚠️'}</span>
                            <p className="font-medium mt-1">{mapping.allergen.nameEn}</p>
                            {isUserAllergen && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                In your profile
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Leaf className="h-5 w-5" />
                    <span>No major allergens declared</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ingredients */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Rice noodles', 'Shrimp', 'Tofu', 'Eggs', 'Bean sprouts', 'Peanuts', 'Green onions', 'Tamarind sauce', 'Fish sauce', 'Lime', 'Chili flakes'].map((ingredient: string) => {
                    const isAllergen = dish.allergenMappings?.some((mapping: any) => 
                      mapping.contains === 'YES' && mapping.allergen.nameEn === ingredient
                    )
                    const isUserAllergen = isAllergen && userAllergens.includes(ingredient)
                    return (
                      <Badge
                        key={ingredient}
                        variant={isAllergen ? "destructive" : "secondary"}
                        className={`
                          ${isUserAllergen
                            ? "bg-destructive text-destructive-foreground"
                            : isAllergen
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : ""
                          }
                        `}
                      >
                        {ingredient}
                        {isAllergen && ` (${ingredient})`}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card> */}

            {/* Modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  Available Modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Mock modifications for now - this would come from the API */}
                  {[
                    { name: "No peanuts", removes: ["Peanuts"] },
                    { name: "Substitute shrimp with chicken", removes: ["Shellfish"] },
                    { name: "No eggs", removes: ["Eggs"] },
                    { name: "Use gluten-free soy sauce", removes: ["Gluten"] },
                  ].map((mod: any) => (
                    <div
                      key={mod.name}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{mod.name}</span>
                      <div className="flex gap-1">
                        {mod.removes.map((allergen: string) => (
                          <Badge
                            key={allergen}
                            variant="outline"
                            className="text-xs text-green-600 border-green-600"
                          >
                            Removes {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Nutrition & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Nutrition Facts */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Serving size: 1 plate (350g)
                </p>
                <div className="space-y-3">
                  {/* Mock nutrition facts for now - this would come from the API */}
                  {[
                    { key: 'calories', value: '650' },
                    { key: 'protein', value: '25g' },
                    { key: 'carbs', value: '78g' },
                    { key: 'fat', value: '22g' },
                    { key: 'fiber', value: '4g' },
                    { key: 'sodium', value: '1200mg' },
                  ].map((item: any) => (
                    <div key={item.key} className="flex justify-between py-2 border-b last:border-0">
                      <span className="capitalize text-muted-foreground">{item.key}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm">
                      Can this be made without peanuts?
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes, we can prepare this dish without peanuts upon request. Please inform your
                      server when ordering.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm">
                      Is there a vegetarian option?
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes, we can substitute the shrimp with extra tofu or vegetables to make it
                      vegetarian.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm">
                      Is the kitchen separate for allergen-free prep?
                    </AccordionTrigger>
                    <AccordionContent>
                      While we take precautions, we do not have a separate allergen-free kitchen.
                      Cross-contamination is possible.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
