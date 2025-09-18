# Mobile-First Design System Foundation

A comprehensive mobile-first design system foundation for creating award-winning mobile UX across the IEP Hero application.

## 🎯 Design Philosophy

This system follows **mobile-first principles**:
- **Full-width layouts** without desktop constraints
- **Touch-optimized interactions** with 44x44px minimum targets
- **Native mobile feel** with proper safe area handling
- **Edge-to-edge design** on mobile devices
- **Readable typography** with 16px minimum body text

## 📱 Core Components

### Layout Components

#### `ContainerMobile`
```tsx
import { ContainerMobile } from '@/components/mobile'

// Full-width container without desktop constraints
<ContainerMobile padding="md">
  {children}
</ContainerMobile>
```

#### `MobilePage`
```tsx
import { MobilePage } from '@/components/mobile'

// Complete page wrapper with header/footer
<MobilePage
  header={<MobileHeader title="Page Title" />}
  footer={<ActionBar>...</ActionBar>}
>
  {content}
</MobilePage>
```

#### `SafeArea`
```tsx
import { SafeArea, SafeAreaTop, SafeAreaBottom } from '@/components/mobile'

// Handles iOS notch and home indicator
<SafeAreaTop>
  <Header />
</SafeAreaTop>
```

### UI Components

#### `MobileCard`
```tsx
import { MobileCard, MobileCardElevated, MobileCardInteractive } from '@/components/mobile'

// Edge-to-edge cards on mobile, rounded on desktop
<MobileCard variant="elevated" fullWidth>
  {content}
</MobileCard>

// Interactive card with touch feedback
<MobileCardInteractive onClick={handleClick}>
  {content}
</MobileCardInteractive>
```

#### `MobileHeader`
```tsx
import { MobileHeader } from '@/components/mobile'

// Mobile navigation header
<MobileHeader
  title="Page Title"
  onBack={() => navigate(-1)}
  rightAction={<Button>Action</Button>}
/>
```

### Interactive Components

#### `ActionBar`
```tsx
import { ActionBar, ActionBarFloating } from '@/components/mobile'

// Sticky bottom action bar
<ActionBar>
  <Button size="lg" className="flex-1">
    Primary Action
  </Button>
</ActionBar>

// Floating variant
<ActionBarFloating>
  <Button>Save</Button>
</ActionBarFloating>
```

#### `BottomSheet`
```tsx
import { BottomSheet, BottomSheetControlled } from '@/components/mobile'

// Trigger-based bottom sheet
<BottomSheet
  trigger={<Button>Open Sheet</Button>}
  title="Sheet Title"
>
  {content}
</BottomSheet>

// Controlled variant
<BottomSheetControlled
  isOpen={showSheet}
  onClose={() => setShowSheet(false)}
  title="Sheet Title"
>
  {content}
</BottomSheetControlled>
```

### Typography Components

#### Mobile Typography Scale
```tsx
import {
  MobileH1,
  MobileH2,
  MobileH3,
  MobileBodyLarge,
  MobileBody,
  MobileBodySmall,
  MobileLabel,
  MobileCaption,
  MobileLink
} from '@/components/mobile'

// Properly sized for mobile readability
<MobileH1>Main Heading (24px)</MobileH1>
<MobileH2>Section Heading (20px)</MobileH2>
<MobileBody>Body text (16px minimum)</MobileBody>
<MobileCaption>Secondary text (14px)</MobileCaption>
```

## 🎨 CSS Utilities

### Mobile-First Layout Classes
```css
/* Full-width containers without constraints */
.mobile-container
.mobile-page
.mobile-content

/* Grid system that starts single-column */
.mobile-grid
.mobile-grid-sm    /* 2 cols on tablet+ */
.mobile-grid-md    /* 3 cols on desktop+ */
.mobile-grid-lg    /* 4 cols on large+ */
```

### Typography Classes
```css
.mobile-text-base  /* 16px - body minimum */
.mobile-text-lg    /* 18px - large body */
.mobile-text-xl    /* 20px - h3 */
.mobile-text-2xl   /* 24px - h1 */
```

### Touch-Optimized Elements
```css
.mobile-touch-target    /* 44x44px minimum */
.mobile-button-primary
.mobile-button-secondary
.mobile-button-ghost
```

### Card Variants
```css
.mobile-card              /* Edge-to-edge on mobile */
.mobile-card-elevated
.mobile-card-interactive
```

### Form Elements
```css
.mobile-input     /* 16px text to prevent iOS zoom */
.mobile-textarea
```

### List Items
```css
.mobile-list-item
.mobile-list-item-interactive
```

### Spacing Scale (8pt Grid)
```css
.mobile-space-1   /* 8px */
.mobile-space-2   /* 16px */
.mobile-space-3   /* 24px */
.mobile-space-4   /* 32px */
.mobile-space-5   /* 48px */

.mobile-gap-1     /* 8px */
.mobile-gap-2     /* 16px */
.mobile-gap-3     /* 24px */
.mobile-gap-4     /* 32px */
.mobile-gap-5     /* 48px */
```

## 📐 Safe Area Utilities

Essential for modern mobile devices with notches and home indicators:

```css
.pt-safe    /* Handles top notch */
.pb-safe    /* Handles bottom home indicator */
.pl-safe    /* Handles left curve */
.pr-safe    /* Handles right curve */
```

## 🎯 Key Features

### 1. **Full-Width Mobile Layout**
- No max-width constraints on mobile
- Edge-to-edge cards that round on larger screens
- Proper horizontal padding (16px standard)

### 2. **Touch-Optimized Interactions**
- Minimum 44x44px touch targets
- Enhanced active states with scale transforms
- Proper touch feedback timing (150-200ms)

### 3. **Native Mobile Patterns**
- Bottom sheets for modal interactions
- Sticky action bars for primary actions
- Back navigation in headers
- Proper safe area handling

### 4. **Readable Typography**
- 16px minimum body text (prevents iOS zoom)
- Optimized line heights for mobile reading
- Clear information hierarchy

### 5. **Performance Optimized**
- CSS transforms for smooth animations
- Minimal repaints with proper z-indexing
- Touch-action: manipulation for better performance

## 🔧 Implementation Guidelines

### 1. **Mobile-First Development**
```tsx
// ✅ Do this - start with mobile
<MobilePage>
  <ContainerMobile>
    <MobileCard fullWidth>
      <MobileH2>Content Title</MobileH2>
      <MobileBody>Mobile-optimized content</MobileBody>
    </MobileCard>
  </ContainerMobile>
</MobilePage>

// ❌ Don't do this - desktop constraints
<div className="container max-w-4xl mx-auto">
  <Card className="w-96">
    <h2 className="text-sm">Too small for mobile</h2>
  </Card>
</div>
```

### 2. **Touch Target Guidelines**
```tsx
// ✅ Proper touch targets
<Button className="mobile-touch-target">Action</Button>

// ❌ Too small for touch
<Button size="sm">Tiny button</Button>
```

### 3. **Typography Best Practices**
```tsx
// ✅ Mobile-readable text
<MobileBody>This text is readable at 16px</MobileBody>

// ❌ Too small for mobile
<p className="text-sm">Hard to read on mobile</p>
```

## 🚀 Usage Examples

### Complete Mobile Page
```tsx
import {
  MobilePage,
  MobileHeader,
  MobileCard,
  ActionBar,
  MobileH1,
  MobileBody
} from '@/components/mobile'

function MobileFirstPage() {
  return (
    <MobilePage
      header={
        <MobileHeader
          title="Mobile Page"
          onBack={() => navigate(-1)}
        />
      }
      footer={
        <ActionBar>
          <Button size="lg" className="flex-1">
            Save Changes
          </Button>
        </ActionBar>
      }
    >
      <div className="mobile-space-4">
        <MobileCard>
          <MobileH1>Welcome</MobileH1>
          <MobileBody>
            This is a mobile-first layout that feels native
            and provides an excellent user experience.
          </MobileBody>
        </MobileCard>
      </div>
    </MobilePage>
  )
}
```

## 🧪 Testing

Use the included `MobileTestShowcase` component to verify all patterns:

```tsx
import { MobileTestShowcase } from '@/components/mobile'

// Preview all mobile components and patterns
<MobileTestShowcase />
```

## 📋 Checklist for Mobile-First Implementation

- [ ] Use `ContainerMobile` instead of standard containers
- [ ] Apply `mobile-touch-target` to all interactive elements
- [ ] Use mobile typography components (MobileH1, MobileBody, etc.)
- [ ] Implement proper safe area handling
- [ ] Test on actual mobile devices
- [ ] Verify 16px minimum text size
- [ ] Ensure full-width layouts on mobile
- [ ] Add proper touch feedback
- [ ] Use bottom sheets for modal interactions
- [ ] Implement sticky action bars for primary actions

This foundation enables award-winning mobile UX that feels native and provides an exceptional user experience across all devices while maintaining the existing desktop functionality.