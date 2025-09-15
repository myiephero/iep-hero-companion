# FloatingActionButton Component

A comprehensive Floating Action Button (FAB) component system for quick actions throughout the IEP Hero application. Built with accessibility, mobile-optimization, and smooth animations.

## Features

- ✅ **Multiple Variants**: SimpleFAB, ExpandableFAB, PositionedFAB
- ✅ **Mobile Optimized**: 44px minimum touch targets, safe area support
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Smooth Animations**: Hover effects, expand/collapse, scale transforms
- ✅ **Flexible Positioning**: 6 preset positions + custom positioning
- ✅ **Theme Integration**: Uses existing design tokens and color system
- ✅ **Badge Support**: Notification badges with smart formatting (99+ for >99)
- ✅ **TypeScript**: Fully typed with IntelliSense support

## Components

### SimpleFAB
Single action floating button for primary actions.

```tsx
import { SimpleFAB } from "@/components/ui/floating-action-button";
import { Plus } from "lucide-react";

<SimpleFAB
  variant="hero"
  size="default"
  icon={Plus}
  onClick={() => handleAdd()}
  label="Add Item"
  badge={3}
/>
```

### ExpandableFAB  
Multi-action menu that expands in different directions.

```tsx
import { ExpandableFAB, type FABAction } from "@/components/ui/floating-action-button";
import { Plus, FileText, Upload, MessageCircle } from "lucide-react";

const actions: FABAction[] = [
  {
    id: "add-note",
    label: "Add Note", 
    icon: FileText,
    onClick: () => console.log("Add note"),
    variant: "primary"
  },
  {
    id: "upload",
    label: "Upload Document",
    icon: Upload, 
    onClick: () => console.log("Upload"),
    variant: "secondary",
    badge: 2
  }
];

<ExpandableFAB
  variant="hero"
  actions={actions}
  expandDirection="up"
  spacing={16}
  closeOnActionClick={true}
/>
```

### PositionedFAB
Custom positioning with flexible placement.

```tsx
import { PositionedFAB } from "@/components/ui/floating-action-button";
import { Settings } from "lucide-react";

<PositionedFAB
  top="20px"
  right="20px"
  variant="glass"
  size="sm"
  icon={Settings}
  onClick={() => handleSettings()}
/>
```

## Variants

### Color Variants
- `default` - Primary theme color
- `hero` - Gradient hero styling with glow effect
- `secondary` - Secondary theme color
- `success` - Green success color
- `warning` - Yellow/amber warning color  
- `destructive` - Red destructive/error color
- `glass` - Glassmorphism effect with backdrop blur

### Size Variants
- `sm` - 48px (12x12) with 20px icons
- `default` - 56px (14x14) with 24px icons
- `lg` - 64px (16x16) with 28px icons

### Position Variants
- `bottom-right` - Default position (bottom: 24px, right: 24px)
- `bottom-left` - Bottom left corner
- `bottom-center` - Bottom center (auto-centered)
- `top-right` - Top right corner
- `top-left` - Top left corner  
- `custom` - Use customPosition prop for manual positioning

## Props

### SimpleFAB Props
```tsx
interface SimpleFABProps {
  variant?: "default" | "hero" | "secondary" | "success" | "warning" | "destructive" | "glass"
  size?: "sm" | "default" | "lg"
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "custom"
  icon?: LucideIcon
  label?: string
  badge?: string | number
  customPosition?: { top?: string; bottom?: string; left?: string; right?: string }
  onClick: () => void
}
```

### ExpandableFAB Props
```tsx
interface ExpandableFABProps extends Omit<SimpleFABProps, "onClick"> {
  actions: FABAction[]
  mainIcon?: LucideIcon
  expandDirection?: "up" | "down" | "left" | "right"
  spacing?: number
  onMainClick?: () => void
  defaultExpanded?: boolean
  closeOnActionClick?: boolean
}
```

### FABAction Interface
```tsx
interface FABAction {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "destructive"
  disabled?: boolean
  badge?: string | number
}
```

## Real-World Examples

### Parent Dashboard Quick Actions
```tsx
import { ExpandableFAB } from "@/components/ui/floating-action-button";
import { Plus, FileText, Upload, MessageCircle, Target } from "lucide-react";

const ParentDashboard = () => {
  const parentActions = [
    {
      id: "add-note",
      label: "Add Student Note",
      icon: FileText,
      onClick: () => navigate("/parent/students"),
      variant: "primary"
    },
    {
      id: "upload-doc", 
      label: "Upload Document",
      icon: Upload,
      onClick: () => openFileUpload(),
      variant: "secondary"
    },
    {
      id: "message-advocate",
      label: "Message Advocate", 
      icon: MessageCircle,
      onClick: () => navigate("/parent/messages"),
      variant: "success",
      badge: 2
    },
    {
      id: "create-goal",
      label: "Create IEP Goal",
      icon: Target, 
      onClick: () => navigate("/parent/tools/goal-generator"),
      variant: "default"
    }
  ];

  return (
    <div>
      {/* Dashboard content */}
      <ExpandableFAB
        variant="hero"
        actions={parentActions}
        expandDirection="up"
        spacing={18}
        label="Quick Actions"
      />
    </div>
  );
};
```

### Advocate Emergency Actions
```tsx
import { ExpandableFAB } from "@/components/ui/floating-action-button";
import { AlertCircle, Phone, MessageCircle, HelpCircle } from "lucide-react";

const AdvocatePage = () => {
  const emergencyActions = [
    {
      id: "emergency-call",
      label: "Emergency Call",
      icon: Phone,
      onClick: () => initiateEmergencyCall(),
      variant: "destructive"
    },
    {
      id: "urgent-message",
      label: "Urgent Message", 
      icon: MessageCircle,
      onClick: () => sendUrgentMessage(),
      variant: "warning"
    },
    {
      id: "crisis-resources",
      label: "Crisis Resources",
      icon: HelpCircle,
      onClick: () => navigate("/crisis-resources"),
      variant: "secondary"
    }
  ];

  return (
    <div>
      {/* Page content */}
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
    </div>
  );
};
```

### Notification Badge FAB
```tsx
import { PositionedFAB } from "@/components/ui/floating-action-button";
import { Bell } from "lucide-react";

const NotificationFAB = () => {
  const [notificationCount, setNotificationCount] = useState(5);

  return (
    <PositionedFAB
      top="100px"
      right="20px"
      variant="glass"
      size="sm"
      icon={Bell}
      onClick={() => {
        setNotificationCount(0);
        navigate("/notifications");
      }}
      label="Notifications"
      badge={notificationCount > 0 ? notificationCount : undefined}
    />
  );
};
```

## Mobile Optimizations

### Touch Targets
- Minimum 44px touch targets on mobile
- Proper spacing between expandable actions
- Safe area support for notched devices

### Responsive Behavior
```tsx
// Actions automatically hide labels on small screens
// Backdrop blur overlay on mobile when expanded
// Escape key and outside click to close

<ExpandableFAB
  actions={actions}
  expandDirection="up"
  spacing={16} // Automatically adjusts for mobile
  closeOnActionClick={true} // Better mobile UX
/>
```

### Safe Areas
```css
/* Automatically applied safe area classes */
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pt { padding-top: env(safe-area-inset-top); }
.safe-area-pl { padding-left: env(safe-area-inset-left); }
.safe-area-pr { padding-right: env(safe-area-inset-right); }
```

## Accessibility Features

### ARIA Support
- `aria-label` for screen readers
- `aria-expanded` for expandable FABs  
- `aria-haspopup="menu"` for menu-style FABs
- `role="button"` for proper semantics

### Keyboard Navigation
- Tab navigation support
- Enter/Space to activate
- Escape key to close expanded menus
- Focus management and visual indicators

### Screen Reader Support
```tsx
<SimpleFAB
  label="Add new student note" // Read by screen readers
  onClick={handleAdd}
  aria-describedby="fab-help-text" // Additional context
/>
```

## Animation Details

### Hover Effects
- Scale transform on hover (1.05x)
- Shadow elevation changes
- Smooth color transitions

### Expand/Collapse
- Smooth CSS transforms for positioning
- Opacity transitions for show/hide
- Staggered animation timing for multiple actions

### Press States
- Active scale down (0.95x) for tactile feedback
- Reduced shadow during press
- Quick spring-back animation

## Best Practices

### When to Use FABs
✅ **Good for:**
- Primary actions (add, create, compose)
- Quick access to frequently used features  
- Emergency or urgent actions
- Context-specific actions

❌ **Avoid for:**
- Navigation between pages
- Secondary or tertiary actions
- Actions available in main UI
- Destructive actions without confirmation

### Positioning Guidelines
- Use `bottom-right` for primary actions
- Use `top-left` for emergency/urgent actions
- Use `top-right` for notifications/status
- Avoid blocking important content
- Consider mobile keyboard overlays

### Action Organization
- Limit to 6-8 actions maximum
- Group related actions together
- Most important action closest to main FAB
- Use clear, descriptive labels
- Include relevant icons for visual recognition

## Troubleshooting

### Common Issues

**FAB not visible on mobile:**
```css
/* Ensure proper z-index */
.floating-action-button {
  z-index: 50; /* Should be higher than content */
}
```

**Actions not expanding:**
```tsx
// Check action array is properly defined
const actions = [
  {
    id: "unique-id", // Must be unique
    label: "Action Label",
    icon: IconComponent, // Must be valid Lucide icon
    onClick: () => {}, // Must be defined function
  }
];
```

**Touch targets too small:**
```css
/* Mobile touch targets automatically enforced */
@media (max-width: 768px) {
  button { min-height: 44px; min-width: 44px; }
}
```

### Performance Tips
- Use `React.memo` for action components if needed
- Minimize re-renders by memoizing action arrays
- Use `closeOnActionClick={true}` for better mobile UX

## Demo

Visit `/demo/fab` to see all variants and interactions in action.

## Dependencies

- `@radix-ui/react-slot` - For polymorphic button component
- `class-variance-authority` - For variant styling
- `lucide-react` - For icons
- `tailwindcss` - For styling
- `framer-motion` - Optional for enhanced animations