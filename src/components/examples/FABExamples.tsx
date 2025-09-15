import { useState } from "react";
import { 
  SimpleFAB, 
  ExpandableFAB, 
  PositionedFAB,
  type FABAction 
} from "@/components/ui/floating-action-button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  MessageCircle, 
  FileText, 
  Upload,
  Target,
  Calendar,
  Phone,
  User,
  Settings,
  Bell,
  Heart,
  Camera,
  Share,
  Bookmark,
  Search,
  Home,
  Edit,
  Trash2,
  Mail,
  Star,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";

// Parent Dashboard FAB Actions
export const useParentFABActions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const parentQuickActions: FABAction[] = [
    {
      id: "add-note",
      label: "Add Student Note",
      icon: FileText,
      onClick: () => {
        toast({ 
          title: "Add Note", 
          description: "Opening note editor for your student..." 
        });
        // Navigate to notes section or open modal
      },
      variant: "primary"
    },
    {
      id: "upload-document",
      label: "Upload Document", 
      icon: Upload,
      onClick: () => {
        toast({ 
          title: "Upload Document", 
          description: "Opening file picker..." 
        });
        // Open file upload modal or navigate to document vault
      },
      variant: "secondary"
    },
    {
      id: "message-advocate",
      label: "Message Advocate",
      icon: MessageCircle,
      onClick: () => {
        navigate("/parent/messages");
        toast({ 
          title: "Messages", 
          description: "Opening messages with your advocate..." 
        });
      },
      variant: "success",
      badge: 2 // Number of unread messages
    },
    {
      id: "create-goal",
      label: "Create IEP Goal",
      icon: Target,
      onClick: () => {
        navigate("/parent/tools/goal-generator");
        toast({ 
          title: "Goal Generator", 
          description: "Creating new IEP goal..." 
        });
      },
      variant: "default"
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      icon: Calendar,
      onClick: () => {
        navigate("/parent/schedule");
        toast({ 
          title: "Schedule Meeting", 
          description: "Opening meeting scheduler..." 
        });
      },
      variant: "warning"
    }
  ];

  return { parentQuickActions };
};

// Advocate Dashboard FAB Actions  
export const useAdvocateFABActions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const advocateQuickActions: FABAction[] = [
    {
      id: "quick-message",
      label: "Quick Message",
      icon: MessageCircle,
      onClick: () => {
        navigate("/advocate/messages");
        toast({ 
          title: "Messages", 
          description: "Composing message to parent..." 
        });
      },
      variant: "primary"
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      icon: Calendar,
      onClick: () => {
        navigate("/advocate/schedule");
        toast({ 
          title: "Schedule Meeting", 
          description: "Opening calendar..." 
        });
      },
      variant: "secondary"
    },
    {
      id: "emergency-contact",
      label: "Emergency Contact",
      icon: Phone,
      onClick: () => {
        toast({ 
          title: "Emergency Contact", 
          description: "Initiating emergency contact protocol..." 
        });
        // Handle emergency contact logic
      },
      variant: "destructive"
    },
    {
      id: "add-parent",
      label: "Add Parent",
      icon: User,
      onClick: () => {
        navigate("/advocate/create-parent");
        toast({ 
          title: "Add Parent", 
          description: "Creating new parent profile..." 
        });
      },
      variant: "success"
    },
    {
      id: "generate-letter",
      label: "Generate Letter",
      icon: FileText,
      onClick: () => {
        navigate("/advocate/smart-letter-generator");
        toast({ 
          title: "Letter Generator", 
          description: "Opening smart letter generator..." 
        });
      },
      variant: "default"
    }
  ];

  return { advocateQuickActions };
};

// Notification FAB with badge
export const NotificationFAB = () => {
  const [notificationCount, setNotificationCount] = useState(5);
  const { toast } = useToast();

  return (
    <PositionedFAB
      top="100px"
      right="20px"
      variant="glass"
      size="sm"
      icon={Bell}
      onClick={() => {
        setNotificationCount(0);
        toast({ 
          title: "Notifications", 
          description: "Viewing all notifications..." 
        });
      }}
      label="Notifications"
      badge={notificationCount > 0 ? notificationCount : undefined}
    />
  );
};

// Student Profile Actions FAB
export const StudentProfileFAB = ({ studentId }: { studentId?: string }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const studentActions: FABAction[] = [
    {
      id: "add-goal",
      label: "Add Goal",
      icon: Target,
      onClick: () => {
        toast({ 
          title: "Add Goal", 
          description: `Creating goal for student...` 
        });
      },
      variant: "primary"
    },
    {
      id: "progress-note",
      label: "Progress Note",
      icon: FileText,
      onClick: () => {
        toast({ 
          title: "Progress Note", 
          description: "Adding progress note..." 
        });
      },
      variant: "secondary"
    },
    {
      id: "upload-report",
      label: "Upload Report",
      icon: Upload,
      onClick: () => {
        toast({ 
          title: "Upload Report", 
          description: "Uploading student report..." 
        });
      },
      variant: "success"
    },
    {
      id: "schedule-evaluation",
      label: "Schedule Evaluation",
      icon: Calendar,
      onClick: () => {
        toast({ 
          title: "Schedule Evaluation", 
          description: "Scheduling evaluation..." 
        });
      },
      variant: "warning"
    }
  ];

  if (!studentId) return null;

  return (
    <ExpandableFAB
      position="bottom-right"
      variant="hero"
      size="default"
      actions={studentActions}
      expandDirection="up"
      spacing={16}
      label="Student Actions"
      mainIcon={GraduationCap}
      closeOnActionClick={true}
    />
  );
};

// Emergency Actions FAB (for advocates)
export const EmergencyFAB = () => {
  const { toast } = useToast();

  const emergencyActions: FABAction[] = [
    {
      id: "emergency-call",
      label: "Emergency Call",
      icon: Phone,
      onClick: () => {
        toast({ 
          title: "Emergency Call", 
          description: "Initiating emergency call..." 
        });
        // Handle emergency call
      },
      variant: "destructive"
    },
    {
      id: "urgent-message",
      label: "Urgent Message",
      icon: MessageCircle,
      onClick: () => {
        toast({ 
          title: "Urgent Message", 
          description: "Sending urgent message..." 
        });
        // Handle urgent messaging
      },
      variant: "warning"
    },
    {
      id: "crisis-resources",
      label: "Crisis Resources",
      icon: HelpCircle,
      onClick: () => {
        toast({ 
          title: "Crisis Resources", 
          description: "Accessing crisis resources..." 
        });
        // Navigate to crisis resources
      },
      variant: "secondary"
    }
  ];

  return (
    <ExpandableFAB
      position="top-left"
      variant="destructive"
      size="sm"
      actions={emergencyActions}
      expandDirection="down"
      spacing={12}
      label="Emergency Actions"
      mainIcon={AlertCircle}
    />
  );
};

// Quick Tools FAB
export const QuickToolsFAB = ({ userRole }: { userRole: 'parent' | 'advocate' }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const quickToolsActions: FABAction[] = [
    {
      id: "search",
      label: "Search",
      icon: Search,
      onClick: () => {
        toast({ 
          title: "Search", 
          description: "Opening search..." 
        });
      },
      variant: "default"
    },
    {
      id: "home",
      label: "Dashboard",
      icon: Home,
      onClick: () => {
        const dashboardPath = userRole === 'parent' 
          ? '/parent/dashboard-hero' 
          : '/advocate/dashboard-pro';
        navigate(dashboardPath);
      },
      variant: "primary"
    },
    {
      id: "tools",
      label: "Tools Hub",
      icon: Settings,
      onClick: () => {
        const toolsPath = userRole === 'parent' 
          ? '/parent/tools' 
          : '/advocate/tools';
        navigate(toolsPath);
      },
      variant: "secondary"
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      onClick: () => {
        toast({ 
          title: "Help", 
          description: "Opening help center..." 
        });
      },
      variant: "success"
    }
  ];

  return (
    <ExpandableFAB
      customPosition={{ 
        top: "50%", 
        left: "20px"
      }}
      variant="glass"
      size="sm"
      actions={quickToolsActions}
      expandDirection="right"
      spacing={14}
      label="Quick Tools"
      mainIcon={Star}
    />
  );
};

// Simple Add Action FAB (most common use case)
export const SimpleAddFAB = ({ 
  onAddClick, 
  label = "Add Item",
  variant = "hero" as const
}: { 
  onAddClick: () => void;
  label?: string;
  variant?: "default" | "hero" | "secondary" | "success" | "warning" | "destructive" | "glass";
}) => {
  return (
    <SimpleFAB
      variant={variant}
      size="default"
      icon={Plus}
      onClick={onAddClick}
      label={label}
    />
  );
};

// Success/Completion FAB (for completed tasks)
export const SuccessFAB = ({ message }: { message: string }) => {
  const { toast } = useToast();

  return (
    <PositionedFAB
      bottom="100px"
      right="20px"
      variant="success"
      size="default"
      icon={CheckCircle}
      onClick={() => {
        toast({ 
          title: "Success!", 
          description: message 
        });
      }}
      label="Success"
    />
  );
};

// Contextual FAB Examples for different pages
export const FABExamples = {
  // For Student Management pages
  StudentManagement: ({ studentId }: { studentId?: string }) => (
    <StudentProfileFAB studentId={studentId} />
  ),

  // For Dashboard pages
  ParentDashboard: () => {
    const { parentQuickActions } = useParentFABActions();
    return (
      <ExpandableFAB
        variant="hero"
        actions={parentQuickActions}
        expandDirection="up"
        spacing={18}
        label="Quick Actions"
      />
    );
  },

  AdvocateDashboard: () => {
    const { advocateQuickActions } = useAdvocateFABActions();
    return (
      <ExpandableFAB
        variant="hero"
        actions={advocateQuickActions}
        expandDirection="up"
        spacing={18}
        label="Advocate Actions"
      />
    );
  },

  // For Emergency contexts
  Emergency: () => <EmergencyFAB />,

  // For tool pages
  QuickTools: ({ userRole }: { userRole: 'parent' | 'advocate' }) => (
    <QuickToolsFAB userRole={userRole} />
  ),

  // For notifications
  Notifications: () => <NotificationFAB />,

  // For simple add actions
  SimpleAdd: ({ onAdd, label }: { onAdd: () => void; label?: string }) => (
    <SimpleAddFAB onAddClick={onAdd} label={label} />
  ),

  // For success states
  Success: ({ message }: { message: string }) => (
    <SuccessFAB message={message} />
  )
};

export default FABExamples;