import { useState } from "react";
import { 
  SimpleFAB, 
  ExpandableFAB, 
  PositionedFAB,
  type FABAction 
} from "@/components/ui/floating-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MessageCircle, 
  FileText, 
  Upload,
  Target,
  Calendar,
  Phone,
  User,
  Heart,
  Camera,
  Settings,
  Bell,
  Share,
  Download,
  Bookmark,
  Edit,
  Trash2,
  Mail,
  Search,
  Home,
  Star
} from "lucide-react";

export default function FABDemo() {
  const { toast } = useToast();
  const [notificationCount, setNotificationCount] = useState(3);

  // Example actions for different FAB configurations
  const parentActions: FABAction[] = [
    {
      id: "add-note",
      label: "Add Note",
      icon: FileText,
      onClick: () => toast({ title: "Add Note", description: "Opening note editor..." }),
      variant: "primary"
    },
    {
      id: "upload-doc",
      label: "Upload Document",
      icon: Upload,
      onClick: () => toast({ title: "Upload Document", description: "Opening file picker..." }),
      variant: "secondary"
    },
    {
      id: "message-advocate",
      label: "Message Advocate",
      icon: MessageCircle,
      onClick: () => toast({ title: "Message Advocate", description: "Opening message composer..." }),
      variant: "success",
      badge: 2
    },
    {
      id: "create-goal",
      label: "Create Goal",
      icon: Target,
      onClick: () => toast({ title: "Create Goal", description: "Opening goal creator..." })
    }
  ];

  const advocateActions: FABAction[] = [
    {
      id: "quick-message",
      label: "Quick Message",
      icon: MessageCircle,
      onClick: () => toast({ title: "Quick Message", description: "Composing message..." }),
      variant: "primary"
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      icon: Calendar,
      onClick: () => toast({ title: "Schedule Meeting", description: "Opening calendar..." }),
      variant: "secondary"
    },
    {
      id: "emergency-contact",
      label: "Emergency Contact",
      icon: Phone,
      onClick: () => toast({ title: "Emergency Contact", description: "Initiating emergency contact..." }),
      variant: "destructive"
    },
    {
      id: "add-client",
      label: "Add Client",
      icon: User,
      onClick: () => toast({ title: "Add Client", description: "Creating new client..." }),
      variant: "success"
    }
  ];

  const socialActions: FABAction[] = [
    {
      id: "like",
      label: "Like",
      icon: Heart,
      onClick: () => toast({ title: "Liked!", description: "Post liked successfully" }),
      variant: "destructive"
    },
    {
      id: "share",
      label: "Share",
      icon: Share,
      onClick: () => toast({ title: "Share", description: "Sharing content..." }),
      variant: "primary"
    },
    {
      id: "bookmark",
      label: "Bookmark",
      icon: Bookmark,
      onClick: () => toast({ title: "Bookmarked", description: "Added to bookmarks" }),
      variant: "warning"
    },
    {
      id: "camera",
      label: "Camera",
      icon: Camera,
      onClick: () => toast({ title: "Camera", description: "Opening camera..." }),
      variant: "secondary"
    }
  ];

  const quickActions: FABAction[] = [
    {
      id: "search",
      label: "Search",
      icon: Search,
      onClick: () => toast({ title: "Search", description: "Opening search..." })
    },
    {
      id: "home",
      label: "Home",
      icon: Home,
      onClick: () => toast({ title: "Home", description: "Going home..." })
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      onClick: () => toast({ title: "Settings", description: "Opening settings..." })
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Floating Action Button Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive showcase of all FloatingActionButton variants with different configurations, 
            positioning options, and use cases for parent and advocate dashboards.
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Simple FAB Examples */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Simple FAB
              </CardTitle>
              <CardDescription>
                Single action floating buttons with different variants and sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-medium">Variants:</div>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline">Default</Badge>
                <Badge variant="outline">Hero</Badge>
                <Badge variant="outline">Glass</Badge>
                <Badge variant="outline">Success</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Check bottom-right corner for default FAB
              </div>
            </CardContent>
          </Card>

          {/* Expandable FAB Examples */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Expandable FAB
              </CardTitle>
              <CardDescription>
                Multi-action menus that expand in different directions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-medium">Features:</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Parent Actions</span>
                  <Badge variant="secondary">{parentActions.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Advocate Actions</span>
                  <Badge variant="secondary">{advocateActions.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Social Actions</span>
                  <Badge variant="secondary">{socialActions.length}</Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Check bottom-left corner for expandable FAB
              </div>
            </CardContent>
          </Card>

          {/* Positioned FAB Examples */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Positioned FAB
              </CardTitle>
              <CardDescription>
                Custom positioning with flexible placement options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-medium">Positions:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <Badge variant="outline">Top Left</Badge>
                <Badge variant="outline">Top Right</Badge>
                <Badge variant="outline">Bottom Left</Badge>
                <Badge variant="outline">Bottom Right</Badge>
                <Badge variant="outline" className="col-span-2">Custom Position</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Multiple positioned FABs around the screen
              </div>
            </CardContent>
          </Card>

          {/* Mobile Optimizations */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Mobile Features
              </CardTitle>
              <CardDescription>
                Mobile-optimized touch targets and safe area support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Min Touch Target</span>
                  <Badge variant="secondary">44px</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Safe Area Support</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Backdrop Blur</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Escape/Outside Click</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Accessibility
              </CardTitle>
              <CardDescription>
                ARIA labels, keyboard navigation, and screen reader support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">ARIA Labels</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Keyboard Navigation</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Focus Management</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Screen Reader</span>
                  <Badge variant="secondary">✓</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animation Features */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Animations
              </CardTitle>
              <CardDescription>
                Smooth transitions, transforms, and interactive effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Hover Effects</span>
                  <Badge variant="secondary">Scale</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Active States</span>
                  <Badge variant="secondary">Press</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Expand Animation</span>
                  <Badge variant="secondary">Smooth</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Icon Rotation</span>
                  <Badge variant="secondary">45°</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples Section */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              Code examples for implementing different FAB configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Simple FAB</h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono">
                {`<SimpleFAB 
  variant="hero"
  size="lg"
  icon={Plus}
  onClick={() => handleAddAction()}
  label="Add New Item"
  badge={3}
/>`}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Expandable FAB</h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono">
                {`<ExpandableFAB
  variant="primary"
  actions={parentActions}
  expandDirection="up"
  spacing={16}
  closeOnActionClick={true}
/>`}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Positioned FAB</h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono">
                {`<PositionedFAB
  top="20px"
  right="20px"
  variant="glass"
  icon={Settings}
  onClick={() => openSettings()}
/>`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo FABs - Only show a few key examples to avoid clutter */}
      
      {/* Simple FAB - Bottom Right (Default) */}
      <SimpleFAB
        variant="hero"
        size="default"
        icon={Plus}
        onClick={() => toast({ 
          title: "Simple FAB Clicked", 
          description: "This is the default bottom-right FAB" 
        })}
        label="Add Item"
        badge={notificationCount}
      />

      {/* Expandable FAB - Bottom Left */}
      <ExpandableFAB
        position="bottom-left"
        variant="hero"
        size="default"
        actions={parentActions}
        expandDirection="up"
        spacing={20}
        label="Parent Actions"
        onMainClick={() => toast({ 
          title: "Expandable FAB", 
          description: "Click to expand parent actions menu" 
        })}
      />

      {/* Positioned FAB - Top Right (Notifications) */}
      <PositionedFAB
        top="80px"
        right="20px"
        variant="glass"
        size="sm"
        icon={Bell}
        onClick={() => {
          setNotificationCount(0);
          toast({ 
            title: "Notifications", 
            description: "Viewing notifications..." 
          });
        }}
        label="Notifications"
        badge={notificationCount > 0 ? notificationCount : undefined}
      />

      {/* Positioned FAB - Top Left (Quick Actions) */}
      <ExpandableFAB
        customPosition={{ top: "80px", left: "20px" }}
        variant="secondary"
        size="sm"
        actions={quickActions}
        expandDirection="down"
        spacing={12}
        label="Quick Actions"
        mainIcon={Search}
      />

      {/* Social Actions - Right side */}
      <ExpandableFAB
        customPosition={{ top: "50%", right: "20px" }}
        variant="glass"
        size="sm"
        actions={socialActions}
        expandDirection="left"
        spacing={16}
        label="Social Actions"
        mainIcon={Heart}
      />
    </div>
  );
}