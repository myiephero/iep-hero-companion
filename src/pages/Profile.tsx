import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AvatarUpload } from "@/components/AvatarUpload";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
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
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role === 'parent' ? 'Parent' : 'Advocate';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account information and activity.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <AvatarUpload
                  currentImageUrl={user.profileImageUrl || ''}
                  fallbackText={getInitials(user.firstName || '', user.lastName || '')}
                  size="lg"
                  onImageUpdate={(imageUrl) => {
                    // In a real app, this would update the user profile
                    // For now, we'll just show a success message
                    console.log('Profile image updated:', imageUrl);
                  }}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-xl font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email?.split('@')[0] || 'User'
                }
              </h2>
              <p className="text-muted-foreground mb-4">{formatRole(user.role)}</p>
              <Badge variant="secondary" className="mb-4">
                {formatSubscriptionPlan(user.subscriptionPlan)}
              </Badge>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  const route = user.role === 'advocate' ? '/advocate/settings' : '/parent/settings';
                  navigate(route);
                }}
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                {!user.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground italic">No phone number added</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No recent activity</p>
                <p className="text-sm text-muted-foreground">Your activity history will appear here as you use the platform</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}