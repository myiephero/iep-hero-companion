# Overview

My IEP Hero is a comprehensive educational advocacy platform designed to empower parents of children with special needs and connect them with certified advocates. The platform provides AI-powered IEP analysis, document management, meeting preparation tools, and specialized resources for autism and gifted/twice-exceptional learners. Built as a full-stack web application, it serves both parents seeking support and advocates providing professional services.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

**September 12, 2025**: Implemented tier-specific tools with upsell strategy for advocates
- ALL advocates now see the same interface (Agency-tier tools) with subscription-based functionality limits
- Created centralized tool registry system with 20+ advocate tools and comprehensive metadata
- Implemented smart access control with upgrade prompts instead of hidden features
- Built enhanced UI components: FeatureGate, LockedActionButton, and conversion-optimized UpgradePrompt
- Added backend security safeguards with server-side plan validation middleware
- Verified system working across all advocate tiers (starter, pro, agency, agency-plus) with proper access control

**September 12, 2025**: Completed comprehensive tier-specific access control across entire advocate platform
- ALL advocates now see the same unified Agency-tier interface for both tool hub AND dashboard features
- Implemented tier-based restrictions with upgrade prompts on all major dashboard functions:
  * Client Management, Schedule Management, Professional Analysis, Advocate Messaging
  * Case Analytics, Advocacy Reports, Document Vault, Case Matching
  * Activity Feed, Quick Actions, and Business Management features
- Dashboard now uses same proven access control system as tool hub with FeatureGate and LockedActionButton components
- Complete conversion-optimized experience: show-all-with-restrictions approach instead of hiding premium features
- Server-side security validation ensures plan requirements are enforced at API level
- System tested and verified working across all advocate tiers (starter → pro → agency → agency-plus)

**September 12, 2025**: Fixed critical data flow failure in gifted assessment tools
- Replaced fake save functionality in Cognitive Assessment, Enrichment Needs, and 2E Support dialogs
- Implemented real API calls that collect checkbox data and save to database via POST requests
- Assessment data now properly flows: assessment save → database storage → AI insights retrieval → accommodations generation
- Verified complete data integration with server logs showing successful database inserts

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript built on Vite for fast development and optimized builds
- **UI Framework**: Shadcn/UI components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack React Query for server state management with built-in caching and synchronization
- **Routing**: React Router with role-based route protection and dashboard layouts
- **Authentication**: Context-based auth system integrating with Supabase Auth

## Backend Architecture
- **API Framework**: FastAPI with async/await support for high-performance Python backend
- **Database**: MongoDB with Motor async driver for document storage and user data
- **Authentication**: Supabase Auth for user management with role-based access control
- **File Storage**: Document upload and management system with secure file handling
- **AI Integration**: Emergent LLM integration for IEP analysis and educational insights

## Data Storage Solutions
- **Primary Database**: MongoDB for flexible document storage supporting complex IEP data structures
- **User Authentication**: Supabase for secure user management and session handling
- **File Storage**: Integrated document vault for IEP documents, evaluations, and educational records
- **Caching**: TanStack Query for client-side data caching and synchronization

## Authentication and Authorization
- **User Roles**: Two-tier system with 'parent' and 'advocate' roles
- **Protected Routes**: Role-based route protection with automatic redirection
- **Session Management**: Supabase Auth with persistent sessions and automatic token refresh
- **Profile System**: Extended user profiles with role-specific data and preferences

## Design System
- **Component Library**: Custom design system built on Shadcn/UI with consistent theming
- **Color Palette**: Professional color scheme with primary (deep ocean blue), secondary (vibrant coral), and accent (electric violet) colors
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Accessibility**: WCAG compliant components with proper semantic markup

# External Dependencies

## Third-Party Services
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features
- **Emergent LLM**: AI service for IEP document analysis and educational insights
- **MongoDB Atlas**: Cloud database hosting for production deployments

## Key Libraries
- **UI Components**: Radix UI primitives (@radix-ui/*), Lucide React icons, Embla Carousel
- **Form Management**: React Hook Form with Zod resolvers for type-safe form validation
- **Data Fetching**: TanStack React Query for server state management
- **Styling**: Tailwind CSS, class-variance-authority, clsx utilities
- **Date Handling**: date-fns for date manipulation and formatting
- **Development**: Vite build tool, TypeScript, ESLint configuration

## API Integrations
- **AI Analysis**: Emergent LLM API for document processing and educational recommendations
- **Authentication**: Supabase Auth API for user management
- **Document Processing**: File upload and analysis pipeline for IEP documents
- **Email Services**: Integrated communication system for advocate-parent interactions