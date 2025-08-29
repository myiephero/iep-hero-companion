import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { UserPlus, Mail, Phone, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdvocateCreateParent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create parent via edge function to avoid switching current session
      const { data: inviteRes, error: inviteError } = await supabase.functions.invoke('invite-parent', {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
      });

      if (inviteError) throw inviteError;

      const createdUserId = inviteRes?.userId as string | undefined;

      // Link advocate to the newly invited parent
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && createdUserId) {
        const { error: relationError } = await supabase
          .from('advocate_clients')
          .insert({
            advocate_id: currentUser.id,
            client_id: createdUserId,
            relationship_type: 'parent',
          });

        if (relationError) throw relationError;
      }

      toast({
        title: "Success!",
        description: "Invitation sent to the parent. They'll set up their account via email.",
      });

      navigate('/advocate/dashboard');

    } catch (error: any) {
      console.error('Error creating parent:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parent account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-4">Create New Parent Account</h1>
          <p className="text-muted-foreground">
            Create a new parent account and establish them as your client. They will receive an email to set their password.
          </p>
        </div>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Parent Information
            </CardTitle>
            <CardDescription>
              Fill in the details for the new parent account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 button-premium"
                >
                  {loading ? "Creating Account..." : "Create Parent Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/advocate/dashboard')}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}