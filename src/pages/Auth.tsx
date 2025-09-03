import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Users, Heart, Shield } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);


  const handleAuth = () => {
    setLoading(true);
    // Redirect to Replit OAuth for authentication
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            IEP Hero
          </h1>
          <p className="text-muted-foreground">
            Empowering families through advocacy and support
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Get started with your IEP Hero account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in with your Replit account to access the platform
              </p>
              
              <Button 
                onClick={handleAuth} 
                className="w-full h-12 text-lg font-medium"
                disabled={loading}
                data-testid="button-auth-replit"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Continue with Replit
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                New users will complete role selection and subscription setup after authentication
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">For Parents</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your child's IEP journey with confidence
                </p>
              </div>
              <div className="space-y-2">
                <Shield className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">For Advocates</h3>
                <p className="text-sm text-muted-foreground">
                  Support families with professional tools
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}