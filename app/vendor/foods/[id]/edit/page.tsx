"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Upload,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

const categories = [
  "Appetizer",
  "Main Course",
  "Side Dish",
  "Dessert",
  "Beverage",
  "Soup",
  "Salad",
  "Breakfast",
]

const cuisineTypes = [
  "Malaysian",
  "Chinese",
  "Indian",
  "Western",
  "Japanese",
  "Thai",
  "Korean",
  "Italian",
  "Middle Eastern",
  "Other",
]

export default function EditFoodPage() {
  const router = useRouter()
  const params = useParams()
  const dishId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allergenSelections, setAllergenSelections] = useState<Record<string, { contains: 'YES' | 'NO' | 'MAY_CONTAIN', notes?: string }>>({})
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')

  // Fetch existing dish data
  const { data: existingDish, isLoading: dishLoading } = trpc.vendor.getMyDishes.useQuery({ status: 'ALL' })
  const currentDish = existingDish?.find(dish => dish.id === dishId)

  // Fetch allergens from backend
  const { data: allergens = [], isLoading: allergensLoading } = trpc.consumer.getAllergens.useQuery()

  // Update dish mutation
  const updateDishMutation = trpc.vendor.updateDish.useMutation({
    onSuccess: () => {
      toast.success("Dish updated successfully!")
      router.push("/vendor/foods")
    },
    onError: (error) => {
      try {
        const errors = JSON.parse(error.message)
        if (Array.isArray(errors) && errors.length > 0) {
          const firstError = errors[0]
          toast.error(`Validation Error: ${firstError.message}`, {
            description: `Field: ${firstError.path.join('.')}`
          })
        } else {
          toast.error("Failed to update dish", {
            description: error.message
          })
        }
      } catch {
        toast.error("Failed to update dish", {
          description: error.message
        })
      }
      setIsSubmitting(false)
    }
  })

  const [formData, setFormData] = useState({
    nameEn: "",
    nameMs: "",
    descriptionEn: "",
    descriptionMs: "",
    category: "",
    cuisineType: "",
    price: "",
    preparationTime: "",
    servingSize: "",
    calories: "",
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    imageUrl: "",
  })

  // Initialize form with existing dish data
  useEffect(() => {
    if (currentDish) {
      setFormData({
        nameEn: currentDish.nameEn || "",
        nameMs: currentDish.nameMs || "",
        descriptionEn: currentDish.descriptionEn || "",
        descriptionMs: currentDish.descriptionMs || "",
        category: currentDish.category || "",
        cuisineType: currentDish.cuisineType || "",
        price: currentDish.price?.toString() || "",
        preparationTime: currentDish.preparationTime?.toString() || "",
        servingSize: currentDish.servingSize || "",
        calories: currentDish.calories?.toString() || "",
        isVegetarian: currentDish.isVegetarian || false,
        isVegan: currentDish.isVegan || false,
        isHalal: currentDish.isHalal || false,
        imageUrl: currentDish.imageUrl || "",
      })

      // Initialize allergen selections
      const selections: Record<string, { contains: 'YES' | 'NO' | 'MAY_CONTAIN', notes?: string }> = {}
      currentDish.allergenMappings?.forEach((mapping: any) => {
        selections[mapping.allergenId] = {
          contains: mapping.contains,
          notes: mapping.notes || undefined
        }
      })
      setAllergenSelections(selections)

      if (currentDish.imageUrl) {
        setUploadedImageUrl(currentDish.imageUrl)
      }
    }
  }, [currentDish])

  const handleAllergenChange = (allergenId: string, contains: 'YES' | 'NO' | 'MAY_CONTAIN') => {
    setAllergenSelections(prev => ({
      ...prev,
      [allergenId]: { contains }
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (PNG, JPG, etc.)")
      return
    }

    setIsUploadingImage(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setUploadedImageUrl(base64String)
        setFormData({ ...formData, imageUrl: base64String })
        toast.success("Image uploaded successfully!")
        setIsUploadingImage(false)
      }
      reader.onerror = () => {
        toast.error("Failed to upload image")
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to upload image")
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.nameEn || !formData.descriptionEn || !formData.category || !formData.cuisineType || !formData.price) {
      toast.error("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Validate description length
    if (formData.descriptionEn.length < 10) {
      toast.error("Description must be at least 10 characters long")
      setIsSubmitting(false)
      return
    }

    // Convert allergen selections to array format expected by backend
    const allergenMappings = Object.entries(allergenSelections).map(([allergenId, data]) => ({
      allergenId,
      contains: data.contains,
      notes: data.notes
    }))

    try {
      await updateDishMutation.mutateAsync({
        id: dishId,
        nameEn: formData.nameEn,
        nameMs: formData.nameMs || undefined,
        descriptionEn: formData.descriptionEn,
        descriptionMs: formData.descriptionMs || undefined,
        category: formData.category,
        cuisineType: formData.cuisineType,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl || undefined,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        servingSize: formData.servingSize || undefined,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isHalal: formData.isHalal,
        allergens: allergenMappings,
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  if (dishLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!currentDish) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Dish not found</h2>
        <p className="text-muted-foreground mb-4">The dish you're looking for doesn't exist or you don't have permission to edit it.</p>
        <Button asChild>
          <Link href="/vendor/foods">Back to Foods</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor/foods">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif font-bold"
          >
            Edit Food
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Update your menu item and allergen information
          </motion.p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the details of your food item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Food Name (English) *</Label>
                  <Input
                    id="nameEn"
                    placeholder="e.g., Nasi Lemak"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameMs">Food Name (Malay)</Label>
                  <Input
                    id="nameMs"
                    placeholder="e.g., Nasi Lemak"
                    value={formData.nameMs}
                    onChange={(e) => setFormData({ ...formData, nameMs: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type *</Label>
                  <Select
                    value={formData.cuisineType}
                    onValueChange={(value) => setFormData({ ...formData, cuisineType: value })}
                  >
                    <SelectTrigger id="cuisineType">
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="descriptionEn">Description (English) *</Label>
                  <span className={`text-xs ${formData.descriptionEn.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.descriptionEn.length}/10 min
                  </span>
                </div>
                <Textarea
                  id="descriptionEn"
                  placeholder="Describe your dish, including cooking style and key flavors... (minimum 10 characters)"
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  required
                  minLength={10}
                />
                {formData.descriptionEn.length > 0 && formData.descriptionEn.length < 10 && (
                  <p className="text-xs text-destructive">
                    Description must be at least 10 characters long
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionMs">Description (Malay)</Label>
                <Textarea
                  id="descriptionMs"
                  placeholder="Optional Malay description..."
                  value={formData.descriptionMs}
                  onChange={(e) => setFormData({ ...formData, descriptionMs: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="14.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="30"
                    value={formData.preparationTime}
                    onChange={(e) =>
                      setFormData({ ...formData, preparationTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving">Serving Size</Label>
                  <Input
                    id="serving"
                    placeholder="1 plate"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="450"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  />
                </div>
              </div>

              {/* Image Upload/URL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Food Image</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={imageUploadMode === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadMode('url')}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={imageUploadMode === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadMode('upload')}
                    >
                      Upload
                    </Button>
                  </div>
                </div>

                {imageUploadMode === 'url' ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      type="url"
                    />
                    {formData.imageUrl && (
                      <div className="mt-3 rounded-lg border overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`block border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isUploadingImage
                          ? 'border-muted-foreground/25 cursor-not-allowed'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-10 w-10 mx-auto text-muted-foreground mb-4 animate-spin" />
                      ) : (
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {isUploadingImage
                          ? 'Uploading...'
                          : 'Click to browse or drag and drop an image'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>

                    {uploadedImageUrl && (
                      <div className="mt-3 rounded-lg border overflow-hidden relative">
                        <img
                          src={uploadedImageUrl}
                          alt="Uploaded preview"
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setUploadedImageUrl('')
                            setFormData({ ...formData, imageUrl: '' })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dietary Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Dietary Information</CardTitle>
              <CardDescription>
                Select applicable dietary flags for this dish
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVegetarian"
                    checked={formData.isVegetarian}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVegetarian: checked as boolean })}
                  />
                  <Label htmlFor="isVegetarian" className="font-normal cursor-pointer">
                    Vegetarian (No meat, poultry, or seafood)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVegan"
                    checked={formData.isVegan}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVegan: checked as boolean })}
                  />
                  <Label htmlFor="isVegan" className="font-normal cursor-pointer">
                    Vegan (No animal products)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHalal"
                    checked={formData.isHalal}
                    onCheckedChange={(checked) => setFormData({ ...formData, isHalal: checked as boolean })}
                  />
                  <Label htmlFor="isHalal" className="font-normal cursor-pointer">
                    Halal Certified
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Allergen Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Allergen Information
              </CardTitle>
              <CardDescription>
                Update allergen information for this dish. This information is critical for
                user safety.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For each allergen, please indicate whether it's present, not present, or may contain traces.
                  Accurate information is critical for user safety.
                </AlertDescription>
              </Alert>

              {allergensLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {allergens.map((allergen) => {
                    const selection = allergenSelections[allergen.id]
                    return (
                      <motion.div
                        key={allergen.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{allergen.icon}</span>
                            <div>
                              <p className="font-medium">{allergen.nameEn}</p>
                              {allergen.descriptionEn && (
                                <p className="text-sm text-muted-foreground">{allergen.descriptionEn}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <RadioGroup
                          value={selection?.contains || ''}
                          onValueChange={(value) => handleAllergenChange(allergen.id, value as any)}
                          className="flex gap-4 mt-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="YES" id={`${allergen.id}-yes`} />
                            <Label htmlFor={`${allergen.id}-yes`} className="font-normal cursor-pointer">
                              Contains
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MAY_CONTAIN" id={`${allergen.id}-may`} />
                            <Label htmlFor={`${allergen.id}-may`} className="font-normal cursor-pointer">
                              May Contain
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="NO" id={`${allergen.id}-no`} />
                            <Label htmlFor={`${allergen.id}-no`} className="font-normal cursor-pointer">
                              Does Not Contain
                            </Label>
                          </div>
                        </RadioGroup>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {Object.keys(allergenSelections).filter(id => allergenSelections[id].contains === 'YES').length > 0 && (
                <div className="mt-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Contains Allergens ({Object.keys(allergenSelections).filter(id => allergenSelections[id].contains === 'YES').length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(allergenSelections)
                      .filter(id => allergenSelections[id].contains === 'YES')
                      .map((id) => {
                        const allergen = allergens.find((a) => a.id === id)
                        return (
                          <Badge key={id} variant="destructive" className="gap-1">
                            {allergen?.icon} {allergen?.nameEn}
                          </Badge>
                        )
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <Alert className="flex-1 mr-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your changes will be saved and may require admin review if the dish status changes.
            </AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/vendor/foods">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || updateDishMutation.isPending} className="gap-2">
              {(isSubmitting || updateDishMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Update Dish
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  )
}
