import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Home, 
  Settings, 
  Bell, 
  User, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Heart,
  Share,
  Download,
  Star
} from 'lucide-react'

// Import all mobile components
import {
  ContainerMobile,
  MobilePage,
  SafeArea,
  SafeAreaTop,
  SafeAreaBottom,
  SafeAreaHorizontal,
  SafeAreaFull,
  MobileCard,
  MobileCardElevated,
  MobileCardInteractive,
  MobileCardWithHeader,
  MobileHeader,
  MobileHeaderSimple,
  MobileHeaderWithAction,
  ActionBar,
  ActionBarFloating,
  ActionBarElevated,
  BottomSheet,
  BottomSheetControlled,
  MobileH1,
  MobileH2,
  MobileH3,
  MobileBodyLarge,
  MobileBody,
  MobileBodySmall,
  MobileLabel,
  MobileCaption,
  MobileButtonText,
  MobileLink
} from './index'

/**
 * Comprehensive test showcase for all mobile-first components.
 * This demonstrates proper mobile-first patterns and can be used for testing.
 */
export function MobileTestShowcase() {
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const sampleItems = [
    { id: 1, title: "IEP Meeting Prep", description: "Prepare for upcoming IEP meeting", priority: "High" },
    { id: 2, title: "Document Review", description: "Review latest assessment reports", priority: "Medium" },
    { id: 3, title: "Goal Tracking", description: "Update student progress", priority: "Low" },
    { id: 4, title: "Team Communication", description: "Schedule call with teachers", priority: "High" },
  ]

  return (
    <MobilePage
      header={
        <MobileHeader
          title="Mobile Showcase"
          rightAction={
            <Button variant="ghost" size="sm" className="mobile-touch-target">
              <Settings className="h-5 w-5" />
            </Button>
          }
        />
      }
      footer={
        <ActionBar>
          <Button size="lg" className="flex-1" data-testid="button-primary-action">
            <Plus className="h-5 w-5 mr-2" />
            Add New Task
          </Button>
        </ActionBar>
      }
      data-testid="mobile-test-showcase"
    >
      <div className="mobile-space-4">
        {/* Typography Showcase */}
        <MobileCard className="mobile-space-3" data-testid="card-typography">
          <MobileH2>Typography Scale</MobileH2>
          <div className="mobile-space-2">
            <MobileH1>Mobile H1 Heading</MobileH1>
            <MobileH2>Mobile H2 Heading</MobileH2>  
            <MobileH3>Mobile H3 Heading</MobileH3>
            <MobileBodyLarge>Large body text for important content.</MobileBodyLarge>
            <MobileBody>Standard body text that's readable at 16px minimum.</MobileBody>
            <MobileBodySmall>Small text for secondary information only.</MobileBodySmall>
            <MobileCaption>Caption text for metadata</MobileCaption>
            <MobileLink href="#test">Mobile Link Component</MobileLink>
          </div>
        </MobileCard>

        {/* Card Variants */}
        <div className="mobile-space-3">
          <MobileH3>Card Variants</MobileH3>
          
          <MobileCard variant="default" data-testid="card-default">
            <MobileBody>Default Mobile Card - Full width with edge-to-edge design</MobileBody>
          </MobileCard>

          <MobileCardElevated data-testid="card-elevated">
            <MobileBody>Elevated Card - With enhanced shadow</MobileBody>
          </MobileCardElevated>

          <MobileCardInteractive 
            onClick={() => setShowBottomSheet(true)}
            data-testid="card-interactive"
          >
            <MobileBody>Interactive Card - Tap to open bottom sheet</MobileBody>
            <MobileCaption>Touch feedback included</MobileCaption>
          </MobileCardInteractive>

          <MobileCardWithHeader
            title="Card with Header"
            description="Structured card with title and description"
            headerAction={
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            data-testid="card-with-header"
          >
            <MobileBody>Card content goes here with proper spacing.</MobileBody>
          </MobileCardWithHeader>
        </div>

        {/* Mobile Grid System */}
        <div className="mobile-space-3">
          <MobileH3>Grid System</MobileH3>
          <div className="mobile-grid-sm mobile-gap-2">
            <MobileCard padding="sm">
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <MobileCaption>Single column on mobile</MobileCaption>
              </div>
            </MobileCard>
            <MobileCard padding="sm">
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <MobileCaption>Two columns on tablet+</MobileCaption>
              </div>
            </MobileCard>
          </div>
        </div>

        {/* Mobile Form Elements */}
        <MobileCardWithHeader
          title="Form Elements"
          description="Mobile-optimized form inputs"
          data-testid="card-form-elements"
        >
          <div className="mobile-space-2">
            <div>
              <MobileLabel htmlFor="mobile-search">Search</MobileLabel>
              <Input 
                id="mobile-search"
                placeholder="Search tasks..."
                className="mobile-input mt-1"
                data-testid="input-mobile-search"
              />
            </div>
            
            <div>
              <MobileLabel htmlFor="mobile-notes">Notes</MobileLabel>
              <textarea
                id="mobile-notes" 
                placeholder="Add your notes here..."
                className="mobile-textarea mt-1"
                data-testid="textarea-mobile-notes"
              />
            </div>
          </div>
        </MobileCardWithHeader>

        {/* Touch Targets Demo */}
        <MobileCardWithHeader
          title="Touch Targets"
          description="All interactive elements meet 44x44px minimum"
          data-testid="card-touch-targets"
        >
          <div className="flex flex-wrap mobile-gap-2">
            <Button size="sm" className="mobile-touch-target" data-testid="button-touch-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm" className="mobile-touch-target" data-testid="button-touch-2">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="mobile-touch-target" data-testid="button-touch-3">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="mobile-touch-target" data-testid="button-touch-4">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </MobileCardWithHeader>

        {/* List Items */}
        <MobileCardWithHeader
          title="Task List"
          description="Mobile-optimized list with touch targets"
          data-testid="card-task-list"
        >
          <div className="divide-y divide-border">
            {sampleItems.map((item) => (
              <div key={item.id} className="mobile-list-item-interactive" data-testid={`list-item-${item.id}`}>
                <div className="flex-1 min-w-0">
                  <MobileBody className="font-medium">{item.title}</MobileBody>
                  <MobileCaption>{item.description}</MobileCaption>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'secondary' : 'outline'}
                    data-testid={`badge-priority-${item.id}`}
                  >
                    {item.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </MobileCardWithHeader>

        {/* Safe Area Demo */}
        <MobileCardWithHeader
          title="Safe Area Utilities"
          description="Proper handling of device-specific insets"
          data-testid="card-safe-area"
        >
          <div className="mobile-space-2">
            <SafeAreaTop className="bg-primary/10 p-2 rounded">
              <MobileCaption>Safe Area Top - Handles notch</MobileCaption>
            </SafeAreaTop>
            <SafeAreaHorizontal className="bg-secondary/10 p-2 rounded">
              <MobileCaption>Safe Area Horizontal - Handles side curves</MobileCaption>
            </SafeAreaHorizontal>
            <SafeAreaBottom className="bg-accent/10 p-2 rounded">
              <MobileCaption>Safe Area Bottom - Handles home indicator</MobileCaption>
            </SafeAreaBottom>
          </div>
        </MobileCardWithHeader>
      </div>

      {/* Bottom Sheet Example */}
      <BottomSheetControlled
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Mobile Bottom Sheet"
        description="Native mobile interaction pattern"
      >
        <div className="mobile-space-3">
          <MobileBody>
            This bottom sheet demonstrates the mobile-first approach with proper safe area handling and native feel.
          </MobileBody>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBottomSheet(false)}
              className="flex-1"
              data-testid="button-close-sheet"
            >
              Close
            </Button>
            <Button 
              className="flex-1"
              data-testid="button-confirm-sheet"
            >
              Confirm
            </Button>
          </div>
        </div>
      </BottomSheetControlled>
    </MobilePage>
  )
}