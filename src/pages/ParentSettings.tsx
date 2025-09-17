import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { 
  Moon, 
  Sun, 
  User, 
  Bell, 
  Shield, 
  Settings as SettingsIcon,
  Palette,
  Key,
  Trash2,
  Save
} from "lucide-react";

export default function ParentSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Mobile Header */}
        <PremiumLargeHeader
          title="Account Settings"
          subtitle="Manage your profile and preferences"
          rightAction={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          }
        />

        <ContainerMobile padding="md" className="space-y-8 pb-32">
          {/* Premium Profile Card */}
          <PremiumCard variant="gradient" className="p-6">
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your personal details
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter first name"
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter last name"
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter email address"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="(555) 123-4567"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                    data-testid="input-phone"
                  />
                </div>
                
                {/* Premium Save Button */}
                <Button 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-200"
                  data-testid="button-save-profile"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </PremiumCard>

          {/* Premium Notifications Card */}
          <PremiumCard variant="elevated" className="p-6">
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose how you want to be notified
                  </p>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch 
                    className="data-[state=checked]:bg-blue-600"
                    data-testid="switch-email-notifications" 
                  />
                </div>
                
                <Separator className="bg-gray-200 dark:bg-gray-700" />
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">IEP Meeting Reminders</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get reminded before upcoming meetings
                    </p>
                  </div>
                  <Switch 
                    className="data-[state=checked]:bg-blue-600"
                    data-testid="switch-meeting-reminders" 
                  />
                </div>
                
                <Separator className="bg-gray-200 dark:bg-gray-700" />
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Progress Updates</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notifications when goals are updated
                    </p>
                  </div>
                  <Switch 
                    className="data-[state=checked]:bg-blue-600"
                    data-testid="switch-progress-updates" 
                  />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Premium Appearance Card */}
          <PremiumCard variant="glass" className="p-6">
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                  <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Appearance
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customize your dashboard theme
                  </p>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-blue-600"
                  data-testid="switch-dark-mode"
                />
              </div>
            </div>
          </PremiumCard>

          {/* Premium Security Card */}
          <PremiumCard variant="elevated" className="p-6">
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Privacy & Security
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your account security
                  </p>
                </div>
              </div>

              {/* Security Actions */}
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 justify-start"
                  data-testid="button-change-password"
                >
                  <Key className="h-5 w-5 mr-3" />
                  Change Password
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 justify-start"
                  data-testid="button-two-factor"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Two-Factor Authentication
                </Button>
                
                <Separator className="bg-gray-200 dark:bg-gray-700 my-6" />
                
                <Button 
                  variant="destructive" 
                  className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 justify-start"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Delete Account
                </Button>
              </div>
            </div>
          </PremiumCard>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}