"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  MapPin,
  Camera,
  Save,
  Bell,
  Shield,
  CreditCard,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

export default function VendorSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch vendor profile
  const { data: vendorProfile, isLoading, error, refetch } = trpc.vendor.getProfile.useQuery()

  // Log any errors for debugging
  if (error) {
    console.error("Error fetching vendor profile:", error)
  }

  // Register vendor mutation (for first-time setup)
  const registerVendorMutation = trpc.vendor.registerVendor.useMutation({
    onSuccess: () => {
      toast.success("Vendor profile created successfully!")
      refetch()
    },
    onError: (error) => {
      toast.error("Failed to create profile: " + error.message)
    }
  })

  // Update profile mutation
  const updateProfileMutation = trpc.vendor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!")
      refetch()
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message)
    }
  })

  const isNewVendor = !vendorProfile && !isLoading

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get form values
      const form = document.getElementById('profile-form') as HTMLFormElement
      const formData = new FormData(form)

      if (isNewVendor) {
        // Initial vendor registration
        await registerVendorMutation.mutateAsync({
          businessNameEn: formData.get('businessName') as string,
          businessNameMs: (formData.get('businessNameMs') as string) || undefined,
          businessType: formData.get('businessType') as 'hawker' | 'warung' | 'mamak' | 'restaurant',
          address: formData.get('address') as string,
          state: formData.get('state') as string,
          halalCertified: formData.get('halalCertified') === 'on',
          halalCertNumber: (formData.get('halalCertNumber') as string) || undefined,
        })
      } else {
        // Update existing profile
        await updateProfileMutation.mutateAsync({
          businessNameEn: formData.get('businessName') as string,
          businessNameMs: (formData.get('businessNameMs') as string) || undefined,
          address: formData.get('address') as string,
        })
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }
    
    setIsUploading(true)
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        
        try {
          await updateProfileMutation.mutateAsync({
            image: base64
          })
        } catch (error) {
          console.error('Upload error:', error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to upload photo")
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold"
        >
          {isNewVendor ? 'Complete Your Vendor Profile' : 'Settings'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          {isNewVendor
            ? 'Please complete your business details to start adding dishes'
            : 'Manage your vendor profile and preferences'}
        </motion.p>
      </div>

      {/* New Vendor Alert */}
      {isNewVendor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/10 border border-accent/20 rounded-lg p-4"
        >
          <p className="text-sm">
            <strong>Welcome!</strong> Complete your vendor profile below to get started. Your profile will be reviewed by our admin team before you can add dishes.
          </p>
        </motion.div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  This will be displayed on your vendor profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={vendorProfile?.imageUrl || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-2xl">
                      {vendorProfile?.businessNameEn?.charAt(0)?.toUpperCase() || 'V'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="gap-2 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {isNewVendor ? 'Complete Your Vendor Profile' : 'Business Information'}
                </CardTitle>
                <CardDescription>
                  {isNewVendor
                    ? 'Please provide your business details to get started'
                    : 'Update your restaurant or business details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form id="profile-form" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name (English) *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        defaultValue={vendorProfile?.businessNameEn || ''}
                        required
                        placeholder="e.g., Golden Dragon Restaurant"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessNameMs">Business Name (Malay)</Label>
                      <Input
                        id="businessNameMs"
                        name="businessNameMs"
                        defaultValue={vendorProfile?.businessNameMs || ''}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      {isNewVendor ? (
                        <select
                          id="businessType"
                          name="businessType"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="">Select business type</option>
                          <option value="hawker">Hawker</option>
                          <option value="warung">Warung</option>
                          <option value="mamak">Mamak</option>
                          <option value="restaurant">Restaurant</option>
                        </select>
                      ) : (
                        <Input
                          id="businessType"
                          defaultValue={vendorProfile?.businessType || ''}
                          disabled
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        defaultValue={vendorProfile?.state || ''}
                        required={isNewVendor}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      defaultValue={vendorProfile?.address || ''}
                      required={isNewVendor}
                      rows={2}
                      placeholder="Full business address"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="halalCertified"
                          name="halalCertified"
                          defaultChecked={vendorProfile?.halalCertified || false}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="halalCertified" className="font-normal cursor-pointer">
                          Halal Certified
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="halalCertNumber">Halal Certificate Number</Label>
                      <Input
                        id="halalCertNumber"
                        name="halalCertNumber"
                        defaultValue={vendorProfile?.halalCertNumber || ''}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  </motion.div>
                  {isNewVendor ? 'Creating Profile...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isNewVendor ? 'Complete Registration' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </TabsContent>

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
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: "Food Approval Updates",
                    description: "Get notified when your food items are approved or rejected",
                    defaultChecked: true,
                  },
                  {
                    title: "New Reviews",
                    description: "Receive notifications for new customer reviews",
                    defaultChecked: true,
                  },
                  {
                    title: "Weekly Analytics",
                    description: "Get a weekly summary of your menu performance",
                    defaultChecked: false,
                  },
                  {
                    title: "Marketing Emails",
                    description: "Receive tips and updates about AllergenSafe features",
                    defaultChecked: false,
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between space-x-4"
                  >
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

        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4 bg-accent/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Professional Plan</p>
                      <p className="text-sm text-muted-foreground">$29/month</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">Active</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="rounded bg-muted p-2">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <Button variant="outline">View Billing History</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
