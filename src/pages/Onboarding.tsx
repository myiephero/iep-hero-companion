import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Briefcase, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Onboarding = () => {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'advocate' | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoleSelection = (role: 'parent' | 'advocate') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // Redirect to the appropriate subscription page
      navigate(`/${selectedRole}/subscribe`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Welcome to My IEP Hero
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Let's get your account set up to provide you with the best experience.
            </p>
            <p className="text-lg text-muted-foreground">
              First, tell us your role so we can customize your experience:
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Parent Role */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedRole === 'parent' 
                  ? 'ring-2 ring-primary border-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoleSelection('parent')}
              data-testid="role-card-parent"
            >
              <CardHeader className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
                  selectedRole === 'parent' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Heart className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">I'm a Parent</CardTitle>
                <CardDescription>
                  I have a child with special education needs and want tools to advocate effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">AI-powered IEP analysis and review</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Secure document storage and management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Connect with certified advocates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">IEP meeting preparation tools</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advocate Role */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedRole === 'advocate' 
                  ? 'ring-2 ring-primary border-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoleSelection('advocate')}
              data-testid="role-card-advocate"
            >
              <CardHeader className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
                  selectedRole === 'advocate' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Briefcase className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">I'm an Advocate</CardTitle>
                <CardDescription>
                  I'm a certified special education advocate who helps families navigate the IEP process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Client management dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Secure family communication tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Professional advocacy resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Join our network of experts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              disabled={!selectedRole}
              className="text-lg px-8 py-6"
              data-testid="button-continue-onboarding"
            >
              Continue as {selectedRole ? (selectedRole === 'parent' ? 'Parent' : 'Advocate') : '...'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!selectedRole && (
              <p className="text-sm text-muted-foreground mt-3">
                Please select your role to continue
              </p>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              HIPAA Secure
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Certified Advocates
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Bank-Level Security
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Supports IDEA/FAPE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;