import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { UserSettings } from "@/components/shared/user-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download, 
  Trash2,
  ExternalLink,
  AlertTriangle,
  TrendingUp
} from "lucide-react"

export default function SettingsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Settings" }
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Settings">
      <div className="flex flex-1 flex-col gap-6">
        {/* Overview */}
        <div className="rounded-xl bg-muted/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">Application Settings</h2>
              <p className="text-muted-foreground">
                Customize your preferences including currency settings, display options, and account management.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile & Currency Settings */}
            <UserSettings />

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your financial activities
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get real-time notifications in your browser
                    </p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-alerts">Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when approaching budget limits
                    </p>
                  </div>
                  <Switch id="budget-alerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="investment-updates">Investment Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts for significant portfolio changes
                    </p>
                  </div>
                  <Switch id="investment-updates" />
                </div>
              </CardContent>
            </Card>

            {/* Regional & Compliance */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Regional & Compliance</CardTitle>
                </div>
                <CardDescription>
                  Set your region for tax calculations and regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Primary Region</Label>
                  <select 
                    id="region"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    defaultValue="us"
                  >
                    <option value="us">United States</option>
                    <option value="india">India</option>
                    <option value="eu">European Union</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                    <option value="australia">Australia</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Used for tax calculations, loan compliance, and financial regulations
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax-year">Tax Year</Label>
                  <select 
                    id="tax-year"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    defaultValue="2024"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-tax-calc">Automatic Tax Calculations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic tax calculations based on your region
                    </p>
                  </div>
                  <Switch id="auto-tax-calc" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Risk & Investment Preferences */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <CardTitle>Investment Preferences</CardTitle>
                </div>
                <CardDescription>
                  Configure your risk tolerance and investment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                  <select 
                    id="risk-tolerance"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    defaultValue="moderate"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Affects investment recommendations and portfolio suggestions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="investment-horizon">Investment Horizon</Label>
                  <select 
                    id="investment-horizon"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    defaultValue="long-term"
                  >
                    <option value="short-term">Short-term (1-2 years)</option>
                    <option value="medium-term">Medium-term (3-5 years)</option>
                    <option value="long-term">Long-term (5+ years)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-rebalance">Auto Portfolio Rebalancing</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically suggest portfolio rebalancing
                    </p>
                  </div>
                  <Switch id="auto-rebalance" />
                </div>
              </CardContent>
            </Card>

            {/* Feedback & Support */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Feedback & Support</CardTitle>
                </div>
                <CardDescription>
                  Help us improve Foresight with your feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="feedback-prompts">Feature Feedback Prompts</Label>
                    <p className="text-sm text-muted-foreground">
                      Show prompts to provide feedback on new features
                    </p>
                  </div>
                  <Switch id="feedback-prompts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="usage-analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch id="usage-analytics" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="beta-features">Beta Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Get early access to experimental features
                    </p>
                  </div>
                  <Switch id="beta-features" />
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Submit Feedback
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Privacy & Security</CardTitle>
                </div>
                <CardDescription>
                  Control your data privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch id="data-sharing" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-history">Login History</Label>
                    <p className="text-sm text-muted-foreground">
                      View recent account access activity
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <CardTitle>Data Management</CardTitle>
                </div>
                <CardDescription>
                  Export, backup, or delete your financial data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Export Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download all your financial data in CSV format
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Create a backup of your account data
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Backup Now
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <Label className="text-destructive">Danger Zone</Label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-destructive">Delete Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage Used</span>
                  <span className="text-sm text-muted-foreground">2.1 MB / 100 MB</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm text-muted-foreground">Jan 2024</span>
                </div>
                
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Center
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Help & Support
                </Button>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle>App Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span>1.0.0</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>Dec 2024</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Build</span>
                  <span>#1234</span>
                </div>
                
                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Release Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}