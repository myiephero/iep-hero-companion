# 🚀 Deployment Guide - My IEP Hero Advocate Matching

This guide will help you deploy the Advocate Matching system to Replit in two separate projects.

## 📋 Prerequisites

1. **Replit Account**: Sign up at [https://replit.com](https://replit.com)
2. **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)
3. **OpenAI API Key** (optional): For AI tag extraction

## 🗄️ Step 1: Set Up Supabase Database

1. **Create New Supabase Project**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose organization, name: "my-iep-hero-matching"
   - Wait for project creation

2. **Run Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the entire contents of `/app/database_schema.sql`
   - Paste and run the SQL script
   - Verify tables are created under Database → Tables

3. **Get Connection Details**
   - Go to Settings → API
   - Copy these values (you'll need them later):
     - `Project URL` (e.g., https://abc123.supabase.co)
     - `anon/public key` (starts with eyJ...)
     - `service_role key` (starts with eyJ... - keep this secret!)

## 🔧 Step 2: Deploy Backend (Express API)

1. **Create Backend Replit**
   - Go to [https://replit.com](https://replit.com)
   - Click "Create Repl"
   - Choose "Node.js" template
   - Name: `advocate-matching-api`

2. **Upload Backend Code**
   - Delete default files in Replit
   - Copy all files from `/app/server/` directory:
     - `src/` folder (contains index.ts, routes/match.ts)
     - `package.json`
     - `tsconfig.json` 
     - `.replit`
   - Upload each file/folder to your Replit project

3. **Configure Environment Variables**
   - In Replit, click "Secrets" tab (🔒 icon)
   - Add these environment variables:

   ```
   NODE_ENV=production
   PORT=8001
   CLIENT_URL=*
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   OPENAI_API_KEY=your_openai_key_here_optional
   ```

4. **Deploy and Test**
   - Click "Run" button in Replit
   - Wait for "🚀 My IEP Hero server running on port 8001"
   - Test health endpoint: click the web URL, add `/api/health`
   - Should see: `{"status":"ok","service":"My IEP Hero API"...}`
   - **Copy the Replit URL** (e.g., `https://advocate-matching-api.username.repl.co`)

## 🎨 Step 3: Deploy Frontend (React Client)

1. **Create Frontend Replit**
   - Create another new Replit
   - Choose "Vite" or "Node.js" template  
   - Name: `advocate-matching-client`

2. **Upload Frontend Code**
   - Copy all files from `/app/client/` directory:
     - `src/` folder (contains all React components)
     - `public/` folder
     - `package.json`
     - `vite.config.ts`
     - `tsconfig.json`
     - `.replit`
     - `index.html`
     - `tailwind.config.js`
     - `postcss.config.js`

3. **Configure Environment Variables**
   - In Replit Secrets, add:

   ```
   NODE_ENV=production
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Deploy and Test**
   - Click "Run" button
   - Wait for Vite build to complete
   - Test the web URL - should see "My IEP Hero" interface
   - **Copy the Replit URL** (e.g., `https://advocate-matching-client.username.repl.co`)

## 🔗 Step 4: Connect Frontend to Backend

1. **Update Frontend API Configuration**
   - In your client Replit, open `src/contexts/AuthContext.tsx`
   - Update the axios baseURL to point to your backend Replit URL
   - Or add `VITE_API_BASE_URL` to client environment variables

## 🧪 Step 5: Test Full System

1. **Test API Endpoints**
   ```bash
   # Health check
   GET https://advocate-matching-api.username.repl.co/api/health
   
   # Match proposals (requires auth)
   GET https://advocate-matching-api.username.repl.co/api/match
   ```

2. **Test Frontend**
   - Visit your client URL
   - Try creating user accounts (if auth is set up)
   - Test the matching dashboard

## 🎯 Step 6: Integration with Lovable.dev

Once both Replits are deployed and working:

1. **Add to Lovable.dev Screens**
   - Parent tool: `https://advocate-matching-client.username.repl.co/matching`
   - Advocate tool: `https://advocate-matching-client.username.repl.co/matching`

2. **Set Visibility Rules**
   - Parent: `user.role = parent`  
   - Advocate: `user.role = advocate`

## 🔒 Security Checklist

- ✅ Supabase RLS policies are active
- ✅ Environment variables in Replit Secrets (not code)
- ✅ Service role key kept secret
- ✅ CORS configured properly
- ✅ JWT authentication working

## 🐛 Troubleshooting

**Backend Issues:**
- Check Replit console for TypeScript compilation errors
- Verify all environment variables are set
- Test Supabase connection with a simple query

**Frontend Issues:**  
- Check browser console for JavaScript errors
- Verify API calls are reaching backend
- Check CORS configuration if requests are blocked

**Database Issues:**
- Verify RLS policies allow your test user roles
- Check Supabase logs for query errors
- Ensure all required tables exist

## 📞 Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Replit Docs**: [https://docs.replit.com](https://docs.replit.com)
- **My IEP Hero**: Check project README for specific configuration details

---

✅ **Success Criteria:**
- Both Replit URLs are live and accessible
- Health check returns 200 OK
- Frontend loads without errors  
- Database queries work through RLS
- Ready for Lovable.dev integration