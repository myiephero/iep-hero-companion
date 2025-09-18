import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useState, useEffect } from "react";
import { PremiumCard } from "@/components/mobile";
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Calendar,
  FileCheck,
  MessageSquare,
  TrendingUp,
  CreditCard,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";

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
      {/* Premium Permission Status Card */}
      <PremiumCard variant="elevated" className="p-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Push Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified about important updates
                </p>
              </div>
            </div>
            <Badge variant={permissionStatus.variant} className="flex items-center gap-1.5 px-3 py-1.5">
              {permissionStatus.icon}
              {permissionStatus.text}
            </Badge>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {permissionStatus.description}
            </p>

            {isSupported && (
              <div className="flex gap-3">
                {!permissionState.granted && (
                  <Button
                    onClick={handleEnableNotifications}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl h-11 px-6 shadow-lg shadow-blue-600/25"
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
                    className="h-11 rounded-xl border-gray-200 dark:border-gray-800"
                    data-testid="button-disable-notifications"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable Notifications
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Premium Notification Categories */}
      <div className="space-y-4">
        {/* IEP & Education Card */}
        <PremiumCard variant="glass" className="p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">IEP & Education</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Academic progress and meetings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="iep-meetings" className="font-medium text-gray-900 dark:text-gray-100">
                      IEP Meeting Reminders
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified before scheduled meetings
                    </p>
                  </div>
                </div>
                <Switch
                  id="iep-meetings"
                  checked={preferences.iepMeetingReminders}
                  onCheckedChange={(checked) => updatePreference('iepMeetingReminders', checked)}
                  data-testid="switch-iep-reminders"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="document-analysis" className="font-medium text-gray-900 dark:text-gray-100">
                      Document Analysis Complete
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When AI analysis is finished
                    </p>
                  </div>
                </div>
                <Switch
                  id="document-analysis"
                  checked={preferences.documentAnalysisComplete}
                  onCheckedChange={(checked) => updatePreference('documentAnalysisComplete', checked)}
                  data-testid="switch-document-analysis"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="goal-progress" className="font-medium text-gray-900 dark:text-gray-100">
                      Goal Progress Updates
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Updates on goal achievements
                    </p>
                  </div>
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
        </PremiumCard>

        {/* Communication Card */}
        <PremiumCard variant="glass" className="p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Communication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Messages and urgent alerts</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="new-messages" className="font-medium text-gray-900 dark:text-gray-100">
                      New Messages
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Messages from advocates and team members
                    </p>
                  </div>
                </div>
                <Switch
                  id="new-messages"
                  checked={preferences.newMessages}
                  onCheckedChange={(checked) => updatePreference('newMessages', checked)}
                  data-testid="switch-new-messages"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-red-500" />
                  <div>
                    <Label htmlFor="urgent-alerts" className="font-medium text-gray-900 dark:text-gray-100">
                      Urgent Alerts
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      High-priority notifications
                    </p>
                  </div>
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
        </PremiumCard>

        {/* Account & Reports Card */}
        <PremiumCard variant="glass" className="p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Account & Reports</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Billing and progress reports</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="subscription-updates" className="font-medium text-gray-900 dark:text-gray-100">
                      Subscription Updates
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Billing and plan changes
                    </p>
                  </div>
                </div>
                <Switch
                  id="subscription-updates"
                  checked={preferences.subscriptionUpdates}
                  onCheckedChange={(checked) => updatePreference('subscriptionUpdates', checked)}
                  data-testid="switch-subscription-updates"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="weekly-reports" className="font-medium text-gray-900 dark:text-gray-100">
                      Weekly Progress Reports
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Summary of weekly progress
                    </p>
                  </div>
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
        </PremiumCard>
      </div>

      {/* Premium Save Button */}
      <PremiumCard variant="elevated" className="p-6">
        <Button 
          onClick={savePreferences} 
          disabled={isSaving}
          className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium text-base shadow-lg shadow-green-600/25 active:scale-[0.98] transition-all duration-150"
          data-testid="button-save-preferences"
        >
          <Shield className="h-5 w-5 mr-2" />
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </PremiumCard>
    </div>
  );
}