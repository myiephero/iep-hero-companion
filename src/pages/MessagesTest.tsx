import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SimpleMessaging from '@/components/SimpleMessaging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function MessagesTest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Please Login</h2>
              <p className="text-muted-foreground">You need to be logged in to access messages.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate(user?.role === 'advocate' ? '/advocate/dashboard-starter' : '/parent/dashboard-free')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Messages Test</h1>
            <p className="text-muted-foreground">
              Testing messaging system - User: {user.email} ({user.role})
            </p>
          </div>
        </div>
      </div>

      <SimpleMessaging 
        userRole={user.role as 'parent' | 'advocate'} 
        userId={user.id} 
      />
    </div>
  );
}