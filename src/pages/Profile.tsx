import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, Clock, Settings, Crown, Zap, Shield, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  PremiumFeatureCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <MobileAppShell>
        <SafeAreaFull>
          <ContainerMobile padding="md" className="h-screen flex items-center justify-center">
            <PremiumCard variant="glass" className="p-8 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
              </div>
            </PremiumCard>
          </ContainerMobile>
        </SafeAreaFull>
      </MobileAppShell>
    );
  }

  // Get user initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  };

  // Format subscription plan for display
  const formatSubscriptionPlan = (plan: string) => {
    if (!plan || plan === 'free') return 'Free Member';
    if (plan === 'hero') return 'Hero Plan';
    if (plan === 'pro') return 'Pro Plan';
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role === 'parent' ? 'Parent' : 'Advocate';
  };

  // Get plan color scheme
  const getPlanColors = (plan: string) => {
    if (plan === 'hero') {
      return {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-700 dark:text-purple-300',
        badge: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
      };
    }
    if (plan === 'pro') {
      return {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-700 dark:text-blue-300',
        badge: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      };
    }
    return {
      gradient: 'from-gray-400 to-gray-500',
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      badge: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    };
  };

  const planColors = getPlanColors(user.subscriptionPlan);

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Header */}
        <PremiumLargeHeader
          title="My Profile"
          subtitle="Account settings and information"
          rightAction={
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={() => {
                const route = user.role === 'advocate' ? '/advocate/settings' : '/parent/settings';
                navigate(route);
              }}
              data-testid="header-settings-button"
            >
              <Settings className="h-5 w-5" />
            </Button>
          }
        />

        <ContainerMobile padding="md" className="space-y-6 pb-32">
          {/* Premium Profile Card */}
          <PremiumCard variant="gradient" className="p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent dark:from-blue-950/20 rounded-full transform translate-x-16 -translate-y-16" />
            
            <div className="relative z-10 text-center space-y-4">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <AvatarUpload
                  currentImageUrl={user.profileImageUrl || ''}
                  fallbackText={getInitials(user.firstName || '', user.lastName || '')}
                  size="lg"
                  onImageUpdate={(imageUrl) => {
                    // In a real app, this would update the user profile
                    console.log('Profile image updated:', imageUrl);
                  }}
                  className="mx-auto border-4 border-white/20 shadow-2xl"
                />
              </div>

              {/* User Name */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email?.split('@')[0] || 'User'
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{formatRole(user.role)}</p>
              </div>

              {/* Plan Badge with Premium Styling */}
              <div className="flex justify-center">
                <Badge className={`${planColors.badge} border-0 px-4 py-2 text-sm font-semibold rounded-full`}>
                  <Crown className="h-4 w-4 mr-2" />
                  {formatSubscriptionPlan(user.subscriptionPlan)}
                </Badge>
              </div>

              {/* Plan Features */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
                  <Zap className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Secure</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => {
                    const route = user.role === 'advocate' ? '/advocate/settings' : '/parent/settings';
                    navigate(route);
                  }}
                  data-testid="button-edit-profile"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </PremiumCard>

          {/* Contact Information Card */}
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user.phoneNumber || (
                      <span className="italic text-gray-500 dark:text-gray-400">No phone number added</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Account Actions Card */}
          <PremiumCard variant="elevated" className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Account Actions</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  const route = user.role === 'advocate' ? '/advocate/settings' : '/parent/settings';
                  navigate(route);
                }}
                variant="outline" 
                className="w-full h-12 justify-between rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                data-testid="profile-settings-button"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium">Account Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
              
              <Button 
                onClick={() => navigate(user.role === 'advocate' ? '/advocate/pricing' : '/parent/pricing')}
                variant="outline" 
                className="w-full h-12 justify-between rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                data-testid="profile-billing-button"
              >
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium">Billing & Plans</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
              
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="w-full h-12 justify-between rounded-xl border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                data-testid="profile-signout-button"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </PremiumCard>

          {/* Recent Activity Card */}
          <PremiumCard variant="glass" className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No recent activity</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
                Your activity history will appear here as you use the platform
              </p>
            </div>
          </PremiumCard>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}