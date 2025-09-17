import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/components/NotificationSettings";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { 
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Key,
  Trash2,
  Save
} from "lucide-react";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  // Pre-populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
        await refreshUser(); // Refresh user data
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Header */}
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
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Enter first name"
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                      data-testid="input-firstName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Enter last name"
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                      data-testid="input-lastName"
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                    data-testid="input-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="Enter phone number"
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                    data-testid="input-phoneNumber"
                  />
                </div>

                {/* Premium Save Button */}
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium text-base shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-150"
                  data-testid="button-save-profile"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </PremiumCard>

          {/* Premium Notification Settings - Embedded directly */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your notification preferences
                </p>
              </div>
            </div>
            <NotificationSettings />
          </div>

          {/* Premium Privacy & Security Card */}
          <PremiumCard variant="glass" className="p-6">
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Privacy & Security
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage account security settings
                  </p>
                </div>
              </div>

              {/* Security Actions */}
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 justify-start text-left"
                  data-testid="button-change-password"
                >
                  <Key className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Update your account password</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 justify-start text-left"
                  data-testid="button-two-factor"
                >
                  <Shield className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Add extra security to your account</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 justify-start text-left"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Delete Account</div>
                    <div className="text-sm text-red-500 dark:text-red-400">Permanently remove your account</div>
                  </div>
                </Button>
              </div>
            </div>
          </PremiumCard>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}