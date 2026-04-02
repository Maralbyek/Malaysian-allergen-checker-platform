"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User,
  AlertTriangle,
  Save,
  Bell,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"


export default function ProfilePage() {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Fetch real allergens data
  const { data: allergensData, isLoading: allergensLoading } = trpc.consumer.getAllergens.useQuery()

  // Fetch user's allergen profile
  const { data: userProfile, isLoading: profileLoading, refetch: refetchProfile } = trpc.consumer.getUserAllergenProfile.useQuery()

  // Fetch current user
  const { data: currentUser, isLoading: userLoading } = trpc.auth.me.useQuery()

  // Update allergen profile mutation
  const updateProfileMutation = trpc.consumer.updateUserAllergenProfile.useMutation({
    onSuccess: () => {
      toast.success("Allergy profile updated successfully!")
      refetchProfile()
    },
    onError: (error) => {
      toast.error("Failed to update allergy profile: " + error.message)
    }
  })

  // Transform allergens data
  const allergenOptions = allergensData?.map((allergen: any) => ({
    id: allergen.id,
    label: allergen.nameEn,
    icon: allergen.icon || '⚠️',
    description: allergen.descriptionEn || `Allergen information for ${allergen.nameEn}`,
  })) || []

  // Set selected allergens from user profile when loaded
  useEffect(() => {
    if (userProfile) {
      setSelectedAllergens(userProfile.map((p: any) => p.allergenId))
    }
  }, [userProfile])

  const handleAllergenToggle = (allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfileMutation.mutateAsync({
        allergenIds: selectedAllergens,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold mb-2"
        >
          My Profile
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Manage your allergy profile and preferences
        </motion.p>
      </div>

      <Tabs defaultValue="allergies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="allergies">My Allergies</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-accent bg-accent/5">
              <Shield className="h-4 w-4 text-accent" />
              <AlertDescription>
                Your allergy profile helps us warn you about dishes that may contain your allergens.
                This information is stored securely and only used to personalize your experience.
              </AlertDescription>
            </Alert>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  My Allergens
                </CardTitle>
                <CardDescription>
                  Select all allergens that apply to you. You&apos;ll receive warnings when viewing dishes
                  that contain these ingredients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allergensLoading || profileLoading ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-4 w-4 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {allergenOptions.map((allergen: any) => {
                      const isSelected = selectedAllergens.includes(allergen.id)
                      return (
                      <motion.div
                        key={allergen.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <label
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-destructive bg-destructive/5"
                              : "border-muted hover:border-muted-foreground/30"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleAllergenToggle(allergen.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{allergen.icon}</span>
                              <span className="font-medium">{allergen.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {allergen.description}
                            </p>
                          </div>
                        </label>
                      </motion.div>
                    )
                  })}
                  </div>
                )}

                {selectedAllergens.length > 0 && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Your Active Allergen Alerts ({selectedAllergens.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAllergens.map((id) => {
                        const allergen = allergenOptions.find((a) => a.id === id)
                        return (
                          <Badge key={id} variant="destructive" className="gap-1">
                            {allergen?.icon} {allergen?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving || updateProfileMutation.isPending} className="gap-2">
                    {isSaving || updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Allergy Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {userLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={currentUser?.image || undefined} />
                        <AvatarFallback className="text-2xl">
                          {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline">Change Photo</Button>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={currentUser?.name || ''} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={currentUser?.email || ''} disabled />
                    </div>

                    <div className="flex justify-end">
                      <Button>Save Changes</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: "Allergen Warnings",
                    description: "Get notified when viewing dishes with your allergens",
                    defaultChecked: true,
                  },
                  {
                    title: "New Safe Dishes",
                    description: "Notifications when restaurants add new allergen-safe options",
                    defaultChecked: true,
                  },
                  {
                    title: "Restaurant Updates",
                    description: "Updates from your favorite restaurants",
                    defaultChecked: false,
                  },
                  {
                    title: "Weekly Recommendations",
                    description: "Personalized dish recommendations based on your profile",
                    defaultChecked: false,
                  },
                  {
                    title: "Marketing Emails",
                    description: "News and promotions from AllergenSafe",
                    defaultChecked: false,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
