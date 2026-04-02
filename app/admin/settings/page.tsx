"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Bell,
  Shield,
  Mail,
  Globe,
  Database,
  Save,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface PlatformSettings {
  platformName: string
  supportEmail: string
  description: string
  requireVendorApproval: boolean
  requireFoodApproval: boolean
  allowUserReviews: boolean
}

interface NotificationSettings {
  newVendorRegistration: boolean
  pendingApprovals: boolean
  userReports: boolean
  systemAlerts: boolean
  weeklyReports: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: boolean
  ipWhitelisting: boolean
}

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: "AllergenSafe",
  supportEmail: "support@allergensafe.com",
  description: "Making dining safe and accessible for everyone with food allergies.",
  requireVendorApproval: true,
  requireFoodApproval: true,
  allowUserReviews: true,
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  newVendorRegistration: true,
  pendingApprovals: true,
  userReports: true,
  systemAlerts: true,
  weeklyReports: false,
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorAuth: true,
  sessionTimeout: true,
  ipWhitelisting: false,
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedPlatformSettings = localStorage.getItem('admin_platform_settings')
    const savedNotificationSettings = localStorage.getItem('admin_notification_settings')
    const savedSecuritySettings = localStorage.getItem('admin_security_settings')

    if (savedPlatformSettings) {
      setPlatformSettings(JSON.parse(savedPlatformSettings))
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings))
    }
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings))
    }
  }, [])

  const handleSave = () => {
    setSaving(true)

    // Save to localStorage
    localStorage.setItem('admin_platform_settings', JSON.stringify(platformSettings))
    localStorage.setItem('admin_notification_settings', JSON.stringify(notificationSettings))
    localStorage.setItem('admin_security_settings', JSON.stringify(securitySettings))

    setTimeout(() => {
      setSaving(false)
      toast.success("Settings saved successfully")
    }, 1000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage platform configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>Configure general platform settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input
                        id="platformName"
                        value={platformSettings.platformName}
                        onChange={(e) => setPlatformSettings({...platformSettings, platformName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={platformSettings.supportEmail}
                        onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Platform Description</Label>
                      <Textarea
                        id="description"
                        value={platformSettings.description}
                        onChange={(e) => setPlatformSettings({...platformSettings, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Content Settings
                  </CardTitle>
                  <CardDescription>Manage content moderation and approval settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Vendor Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        New vendors must be approved before they can list foods
                      </p>
                    </div>
                    <Switch
                      checked={platformSettings.requireVendorApproval}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, requireVendorApproval: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Food Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        New food items must be reviewed before going live
                      </p>
                    </div>
                    <Switch
                      checked={platformSettings.requireFoodApproval}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, requireFoodApproval: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow User Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Users can leave reviews for restaurants and dishes
                      </p>
                    </div>
                    <Switch
                      checked={platformSettings.allowUserReviews}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, allowUserReviews: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Configure when to send email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Vendor Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a new vendor registers
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.newVendorRegistration}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newVendorRegistration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pending Approvals</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily digest of items requiring approval
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pendingApprovals}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pendingApprovals: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Immediate notification for user reports
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.userReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userReports: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical system alerts and warnings
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of platform activity
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure platform security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out inactive users
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.sessionTimeout}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, sessionTimeout: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label>IP Whitelisting</Label>
                        <Badge variant="outline">Pro</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Restrict admin access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.ipWhitelisting}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipWhitelisting: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Password</CardTitle>
                  <CardDescription>Update your admin account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
