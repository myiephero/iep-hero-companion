# My IEP Hero - Advocate Matching Platform

A comprehensive platform connecting parents with specialized IEP advocates using intelligent matching algorithms.

## Architecture

- **Server**: Node.js + Express + TypeScript
- **Client**: React + Vite + TypeScript  
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: OpenAI for tag extraction from narratives

## Features

- **Intelligent Matching**: Weighted algorithm considering tags, experience, capacity, language, price, and timezone
- **Auto Tag Extraction**: AI-powered extraction of needs from free-text student narratives
- **Real-time Notifications**: In-app notifications for match proposals and status updates
- **Complete Workflow**: Proposal → Intro Call → Accept/Decline → Assignment
- **Role-based Access**: Separate interfaces for parents and advocates
- **Secure**: Row Level Security policies protect user data

## Quick Setup

1. **Database Setup**
   ```bash
   # Run the SQL schema in your Supabase project
   cat database_schema.sql | supabase db reset --db-url "your_db_url"
   ```

2. **Environment Configuration**
   ```bash
   # Update server/.env with your Supabase and OpenAI credentials
   # Update client/.env with your Supabase credentials
   ```

3. **Install Dependencies**
   ```bash
   # Server dependencies
   cd server && yarn install

   # Client dependencies  
   cd client && yarn install
   ```

4. **Development**
   ```bash
   # Start server (port 8001)
   cd server && yarn dev

   # Start client (port 3000)
   cd client && yarn dev
   ```

## API Endpoints

### Match Management
- `POST /api/match/propose` - Create match proposals
- `GET /api/match` - List user's proposals  
- `POST /api/match/:id/intro` - Request/schedule intro call
- `POST /api/match/:id/accept` - Accept proposal
- `POST /api/match/:id/decline` - Decline proposal
- `GET /api/match/:id/events` - Get proposal timeline

## Database Schema

The system uses these main tables:
- **profiles** - User accounts (parent/advocate/admin)
- **students** - Student profiles with needs and preferences
- **advocate_profiles** - Advocate specialties and capacity
- **match_proposals** - Matching proposals with scores
- **match_events** - Audit trail of proposal actions
- **intro_calls** - Scheduled introductory calls
- **notifications** - In-app notifications
- **assignments** - Active parent-advocate relationships

## Matching Algorithm

Weighted scoring system (0-100%):
- **Tag Overlap**: 45% (Jaccard similarity of needs/specialties)
- **Grade/Area Fit**: 15% (Experience with grade levels)
- **Capacity Available**: 15% (Current caseload vs max capacity)
- **Language Match**: 10% (Shared languages)
- **Price Fit**: 10% (Rate within budget)
- **Timezone Compatibility**: 5% (Geographic alignment)

## Security

- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) policies protect all data access
- Parents can only see their own students and proposals
- Advocates can only see proposals addressed to them
- Admins have full access for platform management

## AI Features

- **Tag Extraction**: OpenAI converts free-text narratives into structured tags
- **Graceful Degradation**: System works with manual tags if AI is unavailable
- **Enhanced Matching**: AI-extracted tags improve match accuracy

## Production Deployment

1. Set up Supabase project with provided schema
2. Configure environment variables
3. Build client: `cd client && yarn build`  
4. Start server: `cd server && yarn start`
5. Serve client build through your web server

## Support

For questions or issues, please refer to the platform documentation or contact support.