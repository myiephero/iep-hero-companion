import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useState, useEffect } from "react";
import { Bell, BellOff, Smartphone, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface NotificationPreferences {
  iepMeetingReminders: boolean;
  documentAnalysisComplete: boolean;
  newMessages: boolean;
  goalProgressUpdates: boolean;
  subscriptionUpdates: boolean;
  weeklyReports: boolean;
  urgentAlerts: boolean;
}

const defaultPreferences: NotificationPreferences = {
  iepMeetingReminders: true,
  documentAnalysisComplete: true,
  newMessages: true,
  goalProgressUpdates: true,
  subscriptionUpdates: true,
  weeklyReports: false,
  urgentAlerts: true,
};

export function NotificationSettings() {
  const { toast } = useToast();
  const {
    isSupported,
    permissionState,
    isRegistered,
    requestPermission,
    unregisterFromNotifications
  } = usePushNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        toast({
          title: "Preferences Saved",
          description: "Your notification preferences have been updated successfully.",
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive important updates on your mobile device.",
      });
    }
  };

  const handleDisableNotifications = async () => {
    await unregisterFromNotifications();
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return {
        icon: <Smartphone className="h-4 w-4" />,
        text: "Web Browser",
        description: "Push notifications are only available on mobile devices",
        variant: "secondary" as const
      };
    }

    if (permissionState.granted && isRegistered) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Enabled",
        description: "Push notifications are active",
        variant: "default" as const
      };
    }

    if (permissionState.denied) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: "Disabled",
        description: "Permission denied. Enable in device settings.",
        variant: "destructive" as const
      };
    }

    return {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Not Set",
      description: "Tap to enable push notifications",
      variant: "outline" as const
    };
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="space-y-6" data-testid="notification-settings">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Get notified about important IEP updates and messages
              </CardDescription>
            </div>
            <Badge variant={permissionStatus.variant} className="flex items-center gap-1">
              {permissionStatus.icon}
              {permissionStatus.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {permissionStatus.description}
            </p>

            {isSupported && (
              <div className="flex gap-2">
                {!permissionState.granted && (
                  <Button
                    onClick={handleEnableNotifications}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-enable-notifications"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                  </Button>
                )}

                {permissionState.granted && (
                  <Button
                    onClick={handleDisableNotifications}
                    variant="outline"
                    data-testid="button-disable-notifications"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable Notifications
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* IEP Related */}
            <div>
              <h4 className="font-medium mb-3">IEP & Education</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="iep-meetings">IEP Meeting Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified before scheduled IEP meetings
                    </p>
                  </div>
                  <Switch
                    id="iep-meetings"
                    checked={preferences.iepMeetingReminders}
                    onCheckedChange={(checked) => updatePreference('iepMeetingReminders', checked)}
                    data-testid="switch-iep-reminders"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="document-analysis">Document Analysis Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      When AI analysis of uploaded documents is finished
                    </p>
                  </div>
                  <Switch
                    id="document-analysis"
                    checked={preferences.documentAnalysisComplete}
                    onCheckedChange={(checked) => updatePreference('documentAnalysisComplete', checked)}
                    data-testid="switch-document-analysis"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="goal-progress">Goal Progress Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on your child's goal progress
                    </p>
                  </div>
                  <Switch
                    id="goal-progress"
                    checked={preferences.goalProgressUpdates}
                    onCheckedChange={(checked) => updatePreference('goalProgressUpdates', checked)}
                    data-testid="switch-goal-progress"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Communication */}
            <div>
              <h4 className="font-medium mb-3">Communication</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-messages">New Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Messages from advocates and other team members
                    </p>
                  </div>
                  <Switch
                    id="new-messages"
                    checked={preferences.newMessages}
                    onCheckedChange={(checked) => updatePreference('newMessages', checked)}
                    data-testid="switch-new-messages"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="urgent-alerts">Urgent Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      High-priority notifications requiring immediate attention
                    </p>
                  </div>
                  <Switch
                    id="urgent-alerts"
                    checked={preferences.urgentAlerts}
                    onCheckedChange={(checked) => updatePreference('urgentAlerts', checked)}
                    data-testid="switch-urgent-alerts"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Account & Reports */}
            <div>
              <h4 className="font-medium mb-3">Account & Reports</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="subscription-updates">Subscription Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Billing, plan changes, and account notifications
                    </p>
                  </div>
                  <Switch
                    id="subscription-updates"
                    checked={preferences.subscriptionUpdates}
                    onCheckedChange={(checked) => updatePreference('subscriptionUpdates', checked)}
                    data-testid="switch-subscription-updates"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Progress Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of your child's weekly progress
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => updatePreference('weeklyReports', checked)}
                    data-testid="switch-weekly-reports"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={savePreferences} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-preferences"
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}