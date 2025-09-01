import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const TEST_USERS = [
  {
    id: 'test-parent-001',
    name: 'Sarah Johnson',
    email: 'sarah.parent@test.com',
    role: 'parent' as const,
    description: 'Parent with special needs child'
  },
  {
    id: 'test-advocate-001',
    name: 'Dr. Michael Chen',
    email: 'michael.advocate@test.com',
    role: 'advocate' as const,
    description: 'Certified educational advocate'
  },
  {
    id: 'test-parent-002',
    name: 'Emily Rodriguez',
    email: 'emily.parent@test.com',
    role: 'parent' as const,
    description: 'Parent seeking IEP support'
  },
  {
    id: 'test-advocate-002',
    name: 'Lisa Thompson',
    email: 'lisa.advocate@test.com',
    role: 'advocate' as const,
    description: 'Experienced special education lawyer'
  },
];

export function UserSwitcher() {
  const { switchUser, user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleUserSwitch = (userId: string, role: 'parent' | 'advocate') => {
    switchUser(userId, role);
    setIsOpen(false);
  };

  const currentUser = TEST_USERS.find(u => u.id === user?.id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm"
          data-testid="button-user-switcher"
        >
          <Settings className="w-4 h-4 mr-2" />
          Test Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Switch Test User
          </DialogTitle>
          <DialogDescription>
            Choose a test user to simulate different roles and scenarios in the application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current User Display */}
          {currentUser && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    Currently logged in as:
                  </CardTitle>
                  <Badge variant={currentUser.role === 'advocate' ? 'default' : 'secondary'}>
                    {currentUser.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div>
                  <p className="font-medium" data-testid="text-current-user-name">
                    {currentUser.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-current-user-email">
                    {currentUser.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentUser.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Test Users */}
          <div>
            <h4 className="text-sm font-medium mb-3">Available Test Users:</h4>
            <div className="grid gap-3">
              {TEST_USERS.map((testUser) => (
                <Card 
                  key={testUser.id}
                  className={`cursor-pointer transition-colors ${
                    testUser.id === user?.id 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'hover:border-primary/30 hover:bg-primary/2'
                  }`}
                  onClick={() => testUser.id !== user?.id && handleUserSwitch(testUser.id, testUser.role)}
                  data-testid={`card-test-user-${testUser.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium" data-testid={`text-user-name-${testUser.id}`}>
                            {testUser.name}
                          </p>
                          <Badge 
                            variant={testUser.role === 'advocate' ? 'default' : 'secondary'}
                            data-testid={`badge-user-role-${testUser.id}`}
                          >
                            {testUser.role}
                          </Badge>
                          {testUser.id === user?.id && (
                            <Badge variant="outline" className="text-xs">
                              current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${testUser.id}`}>
                          {testUser.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testUser.description}
                        </p>
                      </div>
                      {testUser.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-switch-to-${testUser.id}`}
                        >
                          Switch
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Testing Tip:</p>
            <p>
              Each test user has isolated data. Switching users will redirect you to their appropriate dashboard 
              and show their specific documents, students, and match requests.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}